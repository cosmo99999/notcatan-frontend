import { useEffect, useMemo, useState } from "react";
import { Board, Header } from "../components/Board";
import { PlayerCard } from "../components/PlayerCard";
import { useAppContext } from "../App";
import { DevCardGroup, ResourceCardGroup } from "../components/ResourceAndDevCard";
import { Dice } from "../components/Dice";
import { AcceptTrade, Buy, CancelTrade, CreateTrade, DevCardType, Discard, EndEventGameState, EndTurn, GameState, getAllStructuresByPlayer, getPlayer, HandleDiceRoll, MakeBankTrade, Monopoly, MoveRobber, PlayDevCard, Purchase, purchaseToStructureType, RoadBuilding, Rob, StartingSettlement, StructureType, structureTypeToPurchase, YearOfPlenty, type Edge, type Game, type Vertice } from "notcatan-shared";
import { Actions } from "../components/Actions.tsx";
import { ReselectRoadsForRoadBuilding, HighlightBuildLocations, selectTilesForRobber, deselectTilesForRobber } from "../methods.ts";

interface inGameArgs {
  onCallGlobalFunction: (f: Function, args: any[]) => void;
  onSendOnlyGlobalFunction: (f: Function, args: any[]) => void;
}

export function InGame({ onCallGlobalFunction, onSendOnlyGlobalFunction }: inGameArgs) {

  const { game, setGame, me, highlighted, setHighlighted } = useAppContext();

  const [eventCounter, setEventCounter] = useState(0);
  const [rollDice, setRollDice] = useState(false);

  const player = useMemo(
    () => (game ? getPlayer(me, game) : null),
    [game, me]
  )
  const isPreGame = () => {
    if (!game) return;
    if (game.gameState == GameState.Start) {
      return true;
    } else {
      return false;
    }
  }


  function rollDiceLocal(values: [number, number]) {
    const diceValue = values[0] + values[1];
    let updated = HandleDiceRoll(diceValue, game!);
    onSendOnlyGlobalFunction(HandleDiceRoll, [diceValue, game]);
    setRollDice(false);
    if (updated?.gameState == GameState.RobberPlacing) {
      updated = selectTilesForRobber(updated);
    }
    setGame(updated);
  }
  function menuPress(purchase: Purchase) {
    const structure = purchaseToStructureType(purchase);
    if (structure == null) {
      buyItem(null);
      return;
    };
    const [newGame, selected] = HighlightBuildLocations(game!, getPlayer(me, game!)!, structure, highlighted);
    setGame(newGame);
    setHighlighted(selected);
  }
  function buyItem(pos: Edge | Vertice | null) {
    let newGame: Game;
    if (!pos) {
      onCallGlobalFunction(Buy, [undefined, Purchase.DevCard, me, game!]);
    } else {
      if (game!.gameState == GameState.Start) {
        const structures = getAllStructuresByPlayer(me, game!);
        if (structures.length == 0 || structures.length == 2) {
          newGame = StartingSettlement(pos.id, me, game!);
          onSendOnlyGlobalFunction(StartingSettlement, [pos.id, me, game]);
          let selected;
          [newGame, selected] = HighlightBuildLocations(newGame!, player!, StructureType.Road, highlighted, true)
          setHighlighted(selected);
          setGame(newGame);
        } else {
          onCallGlobalFunction(RoadBuilding, [pos.id, me, game]);
        }
      }
      else if (game?.gameState == GameState.RoadBuilding) {
        newGame = RoadBuilding(pos.id, me, game!);
        onSendOnlyGlobalFunction(RoadBuilding, [pos.id, me, game]);
        newGame = ReselectRoadsForRoadBuilding(player!.id, newGame);
        setGame(newGame);
        setEventCounter(prev => prev + 1);
      } else {
        let p: Purchase = structureTypeToPurchase(highlighted)!;
        newGame = Buy(pos!, p, me, game!);
        onSendOnlyGlobalFunction(Buy, [pos, p, me, game]);
        let selected;
        [newGame, selected] = HighlightBuildLocations(newGame!, player!, highlighted, highlighted)
        setHighlighted(selected);
        setGame(newGame);
      }
    }
  }
  function useDevCard(dType: DevCardType) {
    const card = player!.devCards.find(d => d.type == dType && !d.played);
    let newGame = PlayDevCard(card!.id, player!.id, game!);
    let selected: StructureType = StructureType.None;
    if (dType == DevCardType.RoadBuilding) {
      [newGame, selected] = HighlightBuildLocations(newGame!, getPlayer(me, newGame!)!, StructureType.Road, highlighted);
      setHighlighted(selected);
    }
    if (dType == DevCardType.Knight) {
      newGame = selectTilesForRobber(newGame);
    }
    setGame(newGame);
  }

  function placeRobber(tId: number) {
    let newgame = MoveRobber(tId, me, game!);
    onSendOnlyGlobalFunction(MoveRobber, [tId, me, game!]);
    newgame = deselectTilesForRobber(newgame!);
    setGame(newgame);
  }

  useEffect(() => {
    if (eventCounter == 2) {
      let newgame = EndEventGameState(game!);
      onSendOnlyGlobalFunction(EndEventGameState, [game]);
      if (game?.gameState == GameState.RoadBuilding) {
        [newgame] = HighlightBuildLocations(newgame!, getPlayer(me, newgame!)!, StructureType.Road, highlighted);
      }
      setGame(newgame);
      setEventCounter(0);
    }
  }, [eventCounter])


  return (
    <div style={{
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    }}>
      {game && (
        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '40%',
            }}>
              {game.players && (game.players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p} />
              )))}
              {!isPreGame() && (
                <Actions
                  onBankTrade={(t) => { onCallGlobalFunction(MakeBankTrade, [t, game]) }}
                  onCreateTrade={(t) => { onCallGlobalFunction(CreateTrade, [t, game]) }}
                  onMonopoly={(r) => { onCallGlobalFunction(Monopoly, [r, me, game]) }}
                  onYearOfPlenty={(r) => { onCallGlobalFunction(YearOfPlenty, [r, me, game]); setEventCounter(prev => prev + 1); }}
                  onRob={(p) => { onCallGlobalFunction(Rob, [p, me, game]) }}
                  onCancelTrade={() => { onCallGlobalFunction(CancelTrade, [game]) }}
                  onAcceptTrade={() => { onCallGlobalFunction(AcceptTrade, [me, game]) }}
                  onEndTurn={() => { onCallGlobalFunction(EndTurn, [me, game]) }}
                  onBuyMenuPress={menuPress}
                  onRollDice={() => { setRollDice(prev => !prev) }} />
              )}
              {player && (
                <div style={{
                  display: 'flex',
                  margin: '5px 10px 5px 10px',
                  flexDirection: 'column',
                }}>
                  {player && player.resources && (
                    <div style={{
                      marginBottom: '10px',
                    }}>
                      <ResourceCardGroup resources={player.resources}
                        onSubmitDiscard={(r) => { onCallGlobalFunction(Discard, [r, me, game]) }} />
                    </div>
                  )}
                  {player && player.devCards && (
                    <div style={{
                      marginBottom: '10px',
                    }}>
                      <DevCardGroup
                        devcards={player.devCards.filter(d => d.played == false)}
                        played={false}
                        onPress={useDevCard} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Header />
              <Dice
                onFinishedRolling={rollDiceLocal}
                shouldRoll={rollDice} />
              <Board
                onPurchase={buyItem}
                onPlaceRobber={placeRobber}
                game={game}
              />
            </div>
          </div>
          <div>
          </div>
        </div>
      )}
    </div>
  )
}


