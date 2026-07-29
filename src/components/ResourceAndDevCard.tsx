import { DevCardType, GameState, getPlayer, Resource, type DevCard } from 'notcatan-shared';
import '../styles/ui.css';
import { getResourceColour } from './Board';
import { useAppContext } from '../App';
import { useState } from 'react';

export function getResourceName(resource: Resource) {
  switch (resource) {
    case Resource.Brick: return "Brick";
    case Resource.Ore: return "Ore";
    case Resource.Sheep: return "Sheep";
    case Resource.Wood: return "Wood";
    case Resource.Wheat: return "Wheat";
    default: return "";
  }
}
export function getDevCardName(devcardtype: DevCardType) {
  switch (devcardtype) {
    case DevCardType.Knight: return "Knight";
    case DevCardType.Monopoly: return "Monopoly";
    case DevCardType.RoadBuilding: return "Road Building";
    case DevCardType.YearOfPlenty: return "Year of Plenty";
    case DevCardType.VP: return "VP";
  }
}
interface resourceArgs {
  resource: Resource;
  qty: number;
  discardQty: number;
  onSelect: (resource: Resource) => void;
}
export function ResourceCard({ resource, qty, discardQty, onSelect }: resourceArgs) {
  const colour = getResourceColour(resource)!;

  if (discardQty > 0) {
    qty -= discardQty;
  }

  return (
    <div className="resource" onClick={() => { onSelect(resource) }}
      style={{
        background: `rgb(${colour[0]},${colour[1]},${colour[2]})`
      }}
    >
      <div>{getResourceName(resource)}</div>
      <div>{qty > 1 ? `x ${qty}` : ""}</div>
      {discardQty > 0 && (
        <div style={{
          color: 'red',
          fontSize: '24px',
        }}>{discardQty}</div>
      )}
    </div>
  )
}

interface resourceCardGroupArgs {
  resources: Resource[],
  onSubmitDiscard: (resources: Resource[]) => void;
}

export function ResourceCardGroup({ resources, onSubmitDiscard }: resourceCardGroupArgs) {

  const { game } = useAppContext();
  const discardAmount = game?.gameState == GameState.Discard ? Math.floor(resources.length / 2) : 0;
  const [discardResources, setDiscardResources] = useState<Resource[]>([]);

  const wheatQty = resources.filter(r => r == Resource.Wheat).length;
  const brickQty = resources.filter(r => r == Resource.Brick).length;
  const woodQty = resources.filter(r => r == Resource.Wood).length;
  const oreQty = resources.filter(r => r == Resource.Ore).length;
  const sheepQty = resources.filter(r => r == Resource.Sheep).length;

  const [discardWheatQty, setDiscardWheatQty] = useState(0);
  const [discardBrickQty, setDiscardBrickQty] = useState(0);
  const [discardWoodQty, setDiscardWoodQty] = useState(0);
  const [discardOreQty, setDiscardOreQty] = useState(0);
  const [discardSheepQty, setDiscardSheepQty] = useState(0);

  function discardSelect(resource: Resource) {
    if (discardAmount == 0) return;
    if (discardResources.length == discardAmount) return;
    setDiscardResources([...discardResources, resource]);
    switch (resource) {
      case Resource.Brick: setDiscardBrickQty(prev => prev + 1); break;
      case Resource.Ore: setDiscardOreQty(prev => prev + 1); break;
      case Resource.Sheep: setDiscardSheepQty(prev => prev + 1); break;
      case Resource.Wheat: setDiscardWheatQty(prev => prev + 1); break;
      case Resource.Wood: setDiscardWoodQty(prev => prev + 1); break;
    }
  }

  function resetDiscard() {
    setDiscardResources([]);
    setDiscardOreQty(0);
    setDiscardWheatQty(0);
    setDiscardWoodQty(0);
    setDiscardSheepQty(0);
    setDiscardBrickQty(0);
  }

  return (
    <div>
      <div className="resourceGroup">
        {wheatQty ?
          <ResourceCard resource={Resource.Wheat} qty={wheatQty} discardQty={discardWheatQty} onSelect={discardSelect} />
          : null
        }
        {brickQty ?
          <ResourceCard resource={Resource.Brick} qty={brickQty} discardQty={discardBrickQty} onSelect={discardSelect} />
          : null
        }
        {woodQty ?
          <ResourceCard resource={Resource.Wood} qty={woodQty} discardQty={discardWoodQty} onSelect={discardSelect} />
          : null
        }
        {oreQty ?
          <ResourceCard resource={Resource.Ore} qty={oreQty} discardQty={discardOreQty} onSelect={discardSelect} />
          : null
        }
        {sheepQty ?
          <ResourceCard resource={Resource.Sheep} qty={sheepQty} discardQty={discardSheepQty} onSelect={discardSelect} />
          : null
        }
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        {discardResources.length > 0 && (
          <div className="discardButtons"
            onClick={resetDiscard}>Reset
          </div>
        )}
        {(discardAmount !== 0 && discardResources.length == discardAmount) && (
          <div className="discardButtons"
            onClick={() => { onSubmitDiscard(discardResources); resetDiscard() }} >
            Discard
          </div>
        )}
      </div>
    </div>
  )
}
interface developmentCardArgs {
  devcard: DevCardType,
  qty: number,
  played: boolean,
  onPress?: (type: DevCardType) => void,
}
export function DevelopmentCard({ devcard, qty, onPress, played }: developmentCardArgs) {
  const { me, game } = useAppContext();
  const classname = played ? "devcardPlayed" : cardPlayable() ? "devCardPlayable" : "devCardNonPlayable";

  function cardPlayable(): boolean {
    const player = getPlayer(me, game!)!;
    if (player.playedDevThisTurn) {
      return false;
    }
    if (devcard == DevCardType.Knight) {
      if (!(game!.gameState == GameState.PreRoll ||
        game!.gameState == GameState.Turn)) {
        return false;
      }
    } else {
      if (game!.gameState !== GameState.Turn) {
        return false;
      }
    }
    const cardsOfThisType: DevCard[] =
      player.devCards.filter(d => d.type == devcard && !d.played && !d.purchasedThisTurn);
    if (cardsOfThisType.length >= 1) {
      return true;
    }
    return false;
  }
  const action = cardPlayable() ? onPress : () => { };

  return (
    <div className={classname} onClick={() => { action ? action(devcard) : null }}>
      <div>{getDevCardName(devcard)}</div>
      <div>{qty > 1 ? `x ${qty}` : ""}</div>
    </div>
  )
}
interface devCardGroup {
  devcards: DevCard[],
  onPress?: (type: DevCardType) => void;
  played: boolean;
}
export function DevCardGroup({ devcards, onPress, played }: devCardGroup) {
  const knights = devcards.filter(d => d.type == DevCardType.Knight).length;
  const plentys = devcards.filter(d => d.type == DevCardType.YearOfPlenty).length;
  const roadBuilding = devcards.filter(d => d.type == DevCardType.RoadBuilding).length;
  const monopoly = devcards.filter(d => d.type == DevCardType.Monopoly).length;
  const victoryPoints = devcards.filter(d => d.type == DevCardType.VP).length;
  return (
    <div className="devcardGroup">
      {knights ?
        <DevelopmentCard devcard={DevCardType.Knight} qty={knights} played={played} onPress={() => { onPress ? onPress(DevCardType.Knight) : null }} />
        : null
      }
      {plentys ?
        <DevelopmentCard devcard={DevCardType.YearOfPlenty} qty={plentys} played={played} onPress={() => { onPress ? onPress(DevCardType.YearOfPlenty) : null }} />
        : null
      }
      {roadBuilding ?
        <DevelopmentCard devcard={DevCardType.RoadBuilding} qty={roadBuilding} played={played} onPress={() => { onPress ? onPress(DevCardType.RoadBuilding) : null }} />
        : null
      }
      {monopoly ?
        <DevelopmentCard devcard={DevCardType.Monopoly} qty={monopoly} played={played} onPress={() => { onPress ? onPress(DevCardType.Monopoly) : null }} />
        : null
      }
      {victoryPoints ?
        <DevelopmentCard devcard={DevCardType.VP} qty={victoryPoints} played={played} onPress={() => { onPress ? onPress(DevCardType.VP) : null }} />
        : null
      }

    </div>
  )
}
