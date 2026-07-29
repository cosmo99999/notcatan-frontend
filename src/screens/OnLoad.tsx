import { Board } from "../components/Board";
import { useApi } from "../useApi";
import { getPlayer } from "notcatan-shared";
import { PlayerCard } from "../components/PlayerCard";
import { useAppContext } from "../App";

interface setupArgs {
  onSetupComplete: () => void;
}

export function Setup({ onSetupComplete }: setupArgs) {
  const { GET } = useApi();
  const { game, setGame, me } = useAppContext();

  async function randomize() {
    const body = await GET("/game/new");
    const game = body;
    setGame(game);
  }
  function adminPlayer() {
    const player = getPlayer(me, game!)!;
    if (player.id == 0) {
      return true;
    }
    return false;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '100%',
        justifyItems: 'flex-start',
      }}>
        {game && game.players.map(p => (
          <PlayerCard
            key={p.id}
            setup={true}
            player={p} />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          justifyItems: 'center',
        }}
      >
        {game && (
          <Board
            onPlaceRobber={() => { }}
            onPurchase={() => { }}
            game={game} />
        )}
        {(game && adminPlayer()) && (
          <>
            <button
              onClick={randomize}
              style={{
                border: '3px solid black',
                padding: '10px',
                borderRadius: '5px',
                width: 'auto',
                marginBottom: '50px',
                fontSize: "20px"
              }}
            >Randomize</button>
            <button
              onClick={onSetupComplete}
              style={{
                border: '3px solid black',
                padding: '10px',
                borderRadius: '5px',
                width: 'auto',
                marginBottom: '50px',
                fontSize: "20px"
              }}
            >Start Game</button>
          </>
        )}
      </div>
    </div>
  )
}
