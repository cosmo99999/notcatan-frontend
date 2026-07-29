import { CanAfford, GameState, getPlayer, getPlayersToRob, Purchase, Resource, type Player, type Trade } from "notcatan-shared";
import { useAppContext } from "../App";
import { BuyMenu } from "./BuyMenu";
import { useEffect, useState } from "react";
import { getResourceName } from "./ResourceAndDevCard";
import { getPortsForPlayer } from "../methods";
import { getPlayerColour, getResourceColour } from "./Board";


interface actionArgs {
  onRollDice: () => void;
  onYearOfPlenty: (resource: Resource) => void;
  onMonopoly: (resource: Resource) => void;
  onRob: (pId: number) => void;
  onBuyMenuPress: (purchase: Purchase) => void;
  onCreateTrade: (trade: Trade) => void;
  onBankTrade: (trade: Trade) => void;
  onAcceptTrade: () => void;
  onCancelTrade: () => void;
  onEndTurn: () => void;
}

export function Actions({ onMonopoly, onYearOfPlenty, onRob, onRollDice, onBuyMenuPress,
  onCreateTrade, onBankTrade, onCancelTrade, onAcceptTrade, onEndTurn }: actionArgs) {

  const { game, me } = useAppContext();
  const myTurn = game?.currentTurnPlayerId == me;
  const canRoll = myTurn && game.gameState == GameState.PreRoll;
  const inMainTurn = myTurn && game.gameState == GameState.Turn;

  const [playerTradeOpen, setPlayerTradeOpen] = useState(false);
  const [buyMenuOpen, setBuyMenuOpen] = useState(false);
  const [bankTradeOpen, setBankTradeOpen] = useState(false);

  function CanBuyAnything(): boolean {
    const p = getPlayer(me, game!)!;
    const city = CanAfford(Purchase.City, p.resources);
    const settlement = CanAfford(Purchase.Settlement, p.resources);
    const road = CanAfford(Purchase.Road, p.resources);
    const dev = CanAfford(Purchase.DevCard, p.resources);
    if (!city && !settlement && !road && !dev) {
      return false;
    }
    return true;
  }
  function CanPlayerTrade(): boolean {
    if (game?.liveTradeOffer) {
      return false;
    }
    const p = getPlayer(me, game!)!;
    if (p.resources.length == 0) {
      return false;
    }
    return true;
  }
  function CanBankTrade(): boolean {
    const resources = getPlayer(me, game!)!.resources;
    const ports = getPortsForPlayer(me, game!);
    let defaultDeal = 4;
    ports.forEach((p) => {
      if (p?.rate == 3) {
        defaultDeal = 3;
      } else {
        const type = p?.resource;
        const mine = resources.filter(r => r == type).length;
        if (mine >= 2) {
          return true;
        }
      }
    })
    for (let i = 0; i < 5; i++) {
      const res = resources.filter(r => r == i).length;
      if (res >= defaultDeal) {
        return true;
      }
    }
    return false;
  }

  function closeMenus() {
    setPlayerTradeOpen(false);
    setBankTradeOpen(false);
    setBuyMenuOpen(false);
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>
        {canRoll && (
          <RollButton onPress={onRollDice} />
        )}
        {inMainTurn && (
          <>
            {CanBuyAnything() && (
              <div className='buyMenuButton'
                onClick={() => { !buyMenuOpen ? closeMenus() : null; setBuyMenuOpen(prev => !prev); }}>
                Buy
              </div>
            )}
            {CanPlayerTrade() && (
              <div className="tradeMenuButton"
                onClick={() => { !playerTradeOpen ? closeMenus() : null; setPlayerTradeOpen(prev => !prev); }}>
                Offer Trade
              </div>
            )}
            {CanBankTrade() && (
              <div className="tradeMenuButton"
                onClick={() => { !bankTradeOpen ? closeMenus() : null; setBankTradeOpen(prev => !prev); }}>
                Bank Trade
              </div>
            )}
            <div className="tradeMenuButton"
              onClick={onEndTurn}>
              End Turn
            </div>
          </>
        )}
      </div>
      {inMainTurn && (
        <>
          {buyMenuOpen && (
            <BuyMenu onSelect={(p) => { onBuyMenuPress(p); }} />
          )}
          {playerTradeOpen && (
            <PlayerTradingMenu
              onCreateTrade={(t) => { onCreateTrade(t); setPlayerTradeOpen(prev => !prev) }} />
          )}
          {bankTradeOpen && (
            <BankTradeMenu
              onBankTrade={(t) => { onBankTrade(t); setBankTradeOpen(prev => !prev) }} />

          )}
        </>
      )}
      <TradeDisplay onAcceptTrade={onAcceptTrade} onCancelTrade={onCancelTrade} />
      <EventActions onMonopoly={onMonopoly} onRob={onRob} onYearOfPlenty={onYearOfPlenty} />
    </div>
  )
}
interface rollButtonArgs {
  onPress: () => void;
}
function RollButton({ onPress }: rollButtonArgs) {
  return (
    <div
      onClick={onPress}
      className='rollButton'
    >
      Roll
    </div>
  )
}
interface eventActionArgs {
  onYearOfPlenty: (resource: Resource) => void;
  onMonopoly: (resource: Resource) => void;
  onRob: (pId: number) => void;
}
function EventActions({ onYearOfPlenty, onMonopoly, onRob }: eventActionArgs) {
  const { game, me } = useAppContext();
  if (!game || game.currentTurnPlayerId !== me) return;
  let action = (() => {
    switch (game.gameState) {
      case GameState.Monopoly: return onMonopoly;
      case GameState.YearOfPlenty: return onYearOfPlenty;
      case GameState.Stealing: return onRob;
    }
  })()!;
  let titleText = (() => {
    switch (game.gameState) {
      case GameState.Monopoly: return "Select Monopoly resource";
      case GameState.YearOfPlenty: return "Select 2 resources";
      case GameState.Stealing: return "Select player to rob";
    }
  })()!;

  let playersToRob = GameState.Stealing ? getPlayersToRob(game, me) : null;
  return (
    <div>
      <>
        <div>{titleText}</div>
        {(game.gameState == GameState.Monopoly || game.gameState == GameState.YearOfPlenty) && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <div onClick={() => action(Resource.Wheat)}>Wheat</div>
            <div onClick={() => action(Resource.Wood)}>Wood</div>
            <div onClick={() => action(Resource.Ore)}>Ore</div>
            <div onClick={() => action(Resource.Brick)}>Brick</div>
            <div onClick={() => action(Resource.Sheep)}>Sheep</div>
          </div>
        )}
        {game.gameState == GameState.Stealing && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            {(playersToRob && playersToRob.length > 0) && playersToRob.map(p => (
              <RobPlayerButton key={p!.id} onSelect={action} player={p!} />
            ))}
          </div>
        )}
      </>
    </div>
  )
}
interface robPlayerButtonArgs {
  player: Player;
  onSelect: (id: number) => void;
}
function RobPlayerButton({ player, onSelect }: robPlayerButtonArgs) {
  const colour = getPlayerColour(player)!;
  return (
    <div className="robPlayerButton"
      style={{
        background: `rgb(${colour[0]},${colour[1]},${colour[2]})`,
      }}
      onClick={() => onSelect(player.id)}>{player.name}</div>
  )
}
interface tradeResource {
  resource: Resource;
  amount: number;
}
interface tradeSection {
  tradeResources: tradeResource[];
  giving: boolean;
}
interface playerTradingMenuArgs {
  onCreateTrade: (trade: Trade) => void;
}

function PlayerTradingMenu({ onCreateTrade }: playerTradingMenuArgs) {
  const { me, game } = useAppContext();
  const myResources = getPlayer(me, game!)!.resources;
  const g: tradeSection = { tradeResources: [], giving: true };
  const r: tradeSection = { tradeResources: [], giving: false };

  for (let i = 0; i < 5; i++) {
    const entry: tradeResource = { resource: i, amount: 0 };
    r.tradeResources.push(entry)
    if (myResources.some(r => r == i)) {
      g.tradeResources.push(entry)
    }
  }

  const [giving, setGiving] = useState(g);
  const [recieving, setRecieving] = useState(r);
  const [validTrade, setValidTrade] = useState(false);


  function modifyTrade(resource: Resource, give: boolean, increasing: boolean) {
    let tradeSection: tradeSection;
    let setter;

    if (give) {
      tradeSection = structuredClone(giving);
      setter = setGiving;
    }
    else {
      tradeSection = structuredClone(recieving);
      setter = setRecieving;
    }

    const myResourcesOfType = myResources.filter(r => r == resource);
    let res: tradeResource = tradeSection.tradeResources.find(tr => tr.resource == resource)!;

    if (give && increasing) {
      if (myResourcesOfType.length == res.amount) {
        return;
      }
    }
    if (increasing) res.amount++;
    else if (res.amount > 0) res.amount--;

    setter(tradeSection);
  }
  function createTrade() {
    let trade: Trade = {
      playerId: me,
      giving: [],
      recieving: [],
    };
    giving.tradeResources.forEach((tr) => {
      if (tr.amount > 0) {
        for (let i = 0; i < tr.amount; i++) {
          trade.giving.push(tr.resource);
        }
      }
    })
    recieving.tradeResources.forEach((tr) => {
      if (tr.amount > 0) {
        for (let i = 0; i < tr.amount; i++) {
          trade.recieving.push(tr.resource);
        }
      }
    })
    onCreateTrade(trade);
  }
  useEffect(() => {
    let givingResources = false;
    let recievingResources = false;
    giving.tradeResources.forEach((r) => {
      if (r.amount > 0) {
        givingResources = true;
      }
    })
    recieving.tradeResources.forEach((r) => {
      if (r.amount > 0) {
        recievingResources = true;
      }
    })
    if (givingResources && recievingResources) {
      setValidTrade(true);
    } else {
      setValidTrade(false);
    }

  }, [giving, recieving])
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          fontSize: '25px',
        }}>Offering</div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          {giving && giving.tradeResources.map(tr => (
            <PlayerTradeIcon
              key={tr.resource}
              type={tr.resource}
              value={tr.amount}
              onIncrement={() => { modifyTrade(tr.resource, true, true) }}
              onDecrement={() => { modifyTrade(tr.resource, true, false) }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex',
          fontSize: '25px',
        }}>Recieving</div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          {recieving && recieving.tradeResources.map(tr => (
            <PlayerTradeIcon
              key={tr.resource}
              type={tr.resource}
              value={tr.amount}
              onIncrement={() => { modifyTrade(tr.resource, false, true) }}
              onDecrement={() => { modifyTrade(tr.resource, false, false) }}
            />
          ))}
        </div>
      </div>

      {validTrade && (
        <div className="tradeMenuButton" onClick={createTrade} style={{
          marginLeft: '10px',
        }}>Create</div>
      )}
    </div>

  )
}
interface Deal {
  resource: Resource;
  rate: number;
}
interface bankTradingMenuArgs {
  onBankTrade: (trade: Trade) => void;
}
function BankTradeMenu({ onBankTrade }: bankTradingMenuArgs) {
  const { game, me } = useAppContext();
  let bestDeals: Deal[] = [];
  let trades: Trade[] = [];
  const allResources = [0, 1, 2, 3, 4];

  for (let i = 0; i < 5; i++) {
    bestDeals.push({ resource: i, rate: 4 });
  }
  const ports = getPortsForPlayer(me, game!);

  ports.forEach((p) => {
    if (p?.resource == Resource.None) {
      bestDeals = bestDeals.map(value => value = { resource: value.resource, rate: 3 });
    } else {
      const dealIndex = bestDeals.findIndex(d => d.resource == p?.resource);
      bestDeals[dealIndex].rate = 2;
    }
  })

  bestDeals.forEach((d) => {
    const myResources: Resource[] | undefined = getPlayer(me, game!)?.resources.filter(r => r == d.resource);
    if (myResources && myResources.length >= d.rate) {
      let giving: Resource[] = [];
      for (let i = 0; i < d.rate; i++) giving.push(d.resource);
      let recieving: Resource[] = [Resource.None];
      trades.push({ playerId: me, giving: giving, recieving: recieving });
    }
  })

  for (let i = 4; i > -1; i--) {
    let hasTradeOtherThanSelf = false;
    trades.forEach(t => {
      t.giving.forEach((g) => {
        if (g !== i) {
          hasTradeOtherThanSelf = true;
        }
      })
    })
    if (!hasTradeOtherThanSelf) {
      allResources.splice(i, 1);
    }
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row'
    }}>
      {trades.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
        }}>
          {allResources.map(t => (
            <BankTradeIcon key={t} type={t} trades={trades} onSelect={onBankTrade} />
          ))}
        </div>
      )}
    </div>

  )
}
interface tradeIconArgs {
  type: Resource,
  value: number,
  onIncrement: () => void;
  onDecrement: () => void;
}
function PlayerTradeIcon({ type, value, onIncrement, onDecrement }: tradeIconArgs) {
  const colour = getResourceColour(type)!;

  return (
    <div className="tradeMenuResource" style={{
      background: `rgb(${colour[0]},${colour[1]},${colour[2]})`,
    }}>
      <div>{getResourceName(type)}</div>
      <div>{value}</div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>
        <div style={{
          padding: '1px 1px 1px 1px',
          border: '1px solid black',
          fontSize: '20px'
        }}
          onClick={onIncrement}>+</div>

        <div style={{
          padding: '1px 2px 1px 2px',
          border: '1px solid black',
          fontSize: '20px'
        }}
          onClick={onDecrement}>-</div>
      </div>
    </div>
  )
}

interface bankTradeIconArgs {
  type: Resource;
  trades: Trade[];
  onSelect: (trade: Trade) => void;
}
function BankTradeIcon({ type, onSelect, trades }: bankTradeIconArgs) {
  const colour = getResourceColour(type)!;
  return (
    <div className="bankMenuTradeOption" style={{
      display: 'flex',
      flexDirection: 'column',
      background: `rgb(${colour[0]},${colour[1]},${colour[2]})`,
    }}>
      <div style={{
        fontSize: '25px',
      }}>{getResourceName(type)}</div>
      {trades && trades.filter(t => t.giving[0] !== type).map(t => (
        <BankTradeOffer
          key={`${type}-${t.giving[0]}`}
          recieving={type}
          trade={t}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface bankTradeOfferArgs {
  recieving: Resource;
  trade: Trade;
  onSelect: (trade: Trade) => void;
}
function BankTradeOffer({ recieving, onSelect, trade }: bankTradeOfferArgs) {
  function select() {
    trade.recieving = [recieving];
    onSelect(trade);
  }
  return (

    <div style={{
      border: '1px solid black',
      borderRadius: '5px',
      padding: '5px',
    }}
      onClick={select}>
      {trade.giving.length}
      {" "}
      {getResourceName(trade.giving[0])}
    </div>
  )
}

interface tradeDisplayArgs {
  onCancelTrade: () => void;
  onAcceptTrade: () => void;
}
function TradeDisplay({ onAcceptTrade, onCancelTrade }: tradeDisplayArgs) {
  const { game, me } = useAppContext();
  if (!game!.liveTradeOffer) {
    return;
  }
  const trade = game!.liveTradeOffer!;
  const isMyTrade = trade.playerId == me;
  const title = () => {
    const playerName = getPlayer(trade.playerId, game!)!.name;
    return `${playerName} is offering`;
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div className="liveTradeBox">
        <div style={{
          fontSize: "25px",
        }}>{title()}</div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {trade && trade.giving.map((g) => (
              <TradeDisplayResource resource={g} />
            ))}
          </div>
          <div style={{
            margin: '0 5px 0 5px'
          }}>For</div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {trade && trade.recieving.map((g) => (
              <TradeDisplayResource resource={g} />
            ))}
          </div>

        </div>
      </div>
      {isMyTrade && (
        <div className="liveTradeButton" onClick={onCancelTrade}>Cancel</div>
      )}
      {!isMyTrade && (
        <div className="liveTradeButton" onClick={onAcceptTrade}>Accept</div>
      )}
    </div>
  )
}

interface tradeDisplayResourceArgs {
  resource: Resource;
}
function TradeDisplayResource({ resource }: tradeDisplayResourceArgs) {
  const colour = getResourceColour(resource)!;
  return (

    <div className="currentTradeResource" style={{

      background: `rgb(${colour[0]},${colour[1]},${colour[2]})`,
    }}>
      <div>{getResourceName(resource)}</div>
    </div>
  )
}

