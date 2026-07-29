import type { Player } from "@cosmo99999/notcatan-shared";
import '../styles/ui.css';
import { getPlayerColour } from './Board';
import { DevCardGroup } from './ResourceAndDevCard';
import { useAppContext } from '../App';
import army from '../assets/army.png'
import road from '../assets/road.png'

interface playerCardArgs {
  setup?: boolean;
  player: Player;
}
export function PlayerCard({ player, setup = false }: playerCardArgs) {

  const { game } = useAppContext()!;
  const playersTurn = player.id == game?.currentTurnPlayerId;
  const iconColour = getPlayerColour(player)!;
  const longestRoad = game!.longestRoadId == player.id;
  const largestArmy = game!.largestArmyId == player.id;

  const title = playersTurn ? `*${player.name}` : player.name;
  return (
    <div className="playerCard">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '40px',
        }}>
          <div className="colourIcon"
            style={{
              background: `rgb(${iconColour[0]},${iconColour[1]},${iconColour[2]})`
            }}
          ></div>
          <div style={{
            fontSize: '30px',
          }}
          >{title}</div>

          {!setup && (
            <>
              <div style={{
                fontSize: '30px',
              }}
              >Resources:{player.resources.length}</div>

              <div style={{
                fontSize: '30px',
              }}
              >DevCards:{player.devCards.length}</div>
            </>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          {longestRoad && (
            <img src={road} style={{
              margin: '0 5px 0 5px',
              border: '2px solid black'
            }} />
          )}
          {largestArmy && (
            <img src={army} style={{
              margin: '0 5px 0 5px',
              border: '2px solid black'
            }} />
          )}
          {player.devCards.length > 0 ?
            <DevCardGroup devcards={player.devCards.filter(d => d.played)} played={true} />
            : null
          }
        </div>

      </div>
    </div>
  )
}
