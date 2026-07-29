import { useEffect, useRef, useState } from "react";
import { InGame } from "./screens/InGame";
import { Login } from "./screens/Login";
import { useApi } from "./useApi";
import { useAppContext } from "./App";
import { Setup } from "./screens/OnLoad";
import { deselectVertices, GameState, getAllStructuresByPlayer, getPlayer, GlobalActions, StructureType, type Game } from "@cosmo99999/notcatan-shared";
import { HighlightBuildLocations } from "./methods";

interface ApiReply {
  success: boolean,
  game: Game;
  id: string;
}
interface ApiInGameReply {
  actions: action[];
  update: boolean;
  latestId: number;
}
interface action {
  id?: number;
  func: string;
  args: any[];
}
export function GameWrapper() {

  const { GET, POST } = useApi();
  const { game, setGame, me, setMe, setHighlighted } = useAppContext();
  const hasCalled = useRef(false);

  const actionCounter = useRef(-1);

  const [logIn, setLogIn] = useState(false);
  const [setupPhase, setSetupPhase] = useState(false);
  const [inGame, setInGame] = useState(false);

  async function mainFetch() {
    if (setupPhase) {
      let { game: g } = await GET('/game');
      if (g.gameState == GameState.Start) {
        g = GameStartHighlightCheck(g);
      }
      setGame(g);
      if (g?.currentTurnPlayerId !== undefined) {
        setInGame(true);
        setSetupPhase(false);
      }
    }
    if (inGame) {
      const reply: ApiInGameReply = await GET(`/action/${actionCounter.current}/player/${me}`);
      if (reply.update) {
        actionCounter.current = reply.latestId;
        let newGame = game;
        reply.actions.forEach((a) => {
          const f = GlobalActions.find(fu => fu.name == a.func)! as ((...args: any[]) => any);
          newGame = f(...a.args, newGame);
          if (newGame?.gameState == 0) {
            newGame = GameStartHighlightCheck(newGame);
          }
        })
        setGame(newGame!);
      }
    }
  }
  useEffect(() => {
    const mainFetchLoop = setInterval(mainFetch, 500);
    return () => clearInterval(mainFetchLoop); // also missing! leaks intervals
  }, [setupPhase, inGame, actionCounter, game, setGame]);

  async function tryConnect() {
    if (localStorage.getItem("catanPlayerGuid")) {
      let { success, game, id }: ApiReply = await GET('/game');
      if (success) {
        const p = game.players.find(p => p.guid == id)!;
        setMe(p.id);
        actionCounter.current = game.latestActionId;
        if (game?.gameState == 0) {
          game = GameStartHighlightCheck(game, p.id);
        }
        setGame(game);
        setLogIn(false);
        if (game.currentTurnPlayerId !== undefined) {
          setInGame(true);
        } else {
          setSetupPhase(true);
        }
      } else {
        setLogIn(true);
      }
    } else {
      setLogIn(true);
    }
  }
  function loginSuccess() {
    setLogIn(false);
    setSetupPhase(true);
    tryConnect();
  }
  async function setupComplete() {
    await POST('/game/begin', {});
  }

  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      tryConnect();
    }
  }, []);

  function GameStartHighlightCheck(game: Game, id: number = me): Game {
    const structures = getAllStructuresByPlayer(id, game!);
    if (game && game.gameState == GameState.Start && game.currentTurnPlayerId == id) {
      if (structures.length == 0 || structures.length == 2) {
        let newGame = deselectVertices(game);
        let h;
        [newGame, h] = HighlightBuildLocations(newGame!, getPlayer(id, newGame!)!, StructureType.Settlement, StructureType.None);
        setHighlighted(h);
        return newGame;
      }
    }
    return game;
  }

  function CallGlobalAndSend(f: Function, args: any[]) {
    if (f.name == "AcceptTrade") {
      POST(`/tradeAccept/${me}`, {});
    } else {
      let newGame = f(...args);
      if (newGame.gameState == GameState.Start) {
        newGame = GameStartHighlightCheck(newGame);
      }
      setGame(newGame);
      SendOnlyGlobal(f, args);
    }
  }

  async function SendOnlyGlobal(f: Function, args: any[]) {
    const gameIndex = args.findIndex(a => a.gameState);
    args.splice(gameIndex, 1);
    const msg = {
      func: f.name,
      args: [...args],
    }
    POST(`/action/${me}`, msg);
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        background: 'lightblue'
      }}>
      {logIn && (
        <Login
          onLoginSuccess={loginSuccess} />
      )}
      {setupPhase && (
        <Setup
          onSetupComplete={setupComplete} />
      )}
      {inGame && (
        <InGame
          onCallGlobalFunction={CallGlobalAndSend}
          onSendOnlyGlobalFunction={SendOnlyGlobal}
        />
      )}
    </div>
  )
}

