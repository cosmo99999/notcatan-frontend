import { CanAfford, getPlayer, Purchase, purchaseToStructureType, StructureType, structureTypeToPurchase } from 'notcatan-shared';
import '../styles/ui.css';
import { useAppContext } from '../App';

export function purchaseName(purchase: Purchase) {
  switch (purchase) {
    case Purchase.City: return "City";
    case Purchase.Settlement: return "Settlement";
    case Purchase.Road: return "Road";
    case Purchase.DevCard: return "Development Card";
  }
}
interface buyMenuArgs {
  onSelect: (purchase: Purchase) => void;
}
export function BuyMenu({ onSelect }: buyMenuArgs) {
  const { game, me } = useAppContext();
  const player = getPlayer(me, game!)!;
  const settlement: [boolean, Purchase] = [CanAfford(Purchase.Settlement, player.resources), Purchase.Settlement];
  const city: [boolean, Purchase] = [CanAfford(Purchase.City, player.resources), Purchase.City];
  const road: [boolean, Purchase] = [CanAfford(Purchase.Road, player.resources), Purchase.Road];
  const devCard: [boolean, Purchase] = [CanAfford(Purchase.DevCard, player.resources), Purchase.DevCard];
  const items = [settlement, city, road, devCard];
  return (
    <div className="buyMenuGroup">
      {(items.find(i => i[0] == true)) ? items.map((item) => (
        (item[0] == true &&
          <MenuItem
            key={item[1]}
            onSelect={onSelect}
            structure={
              purchaseToStructureType(item[1]!)!
            }
            purchase={item[1]}
          />
        ))) : null}
    </div>
  )
}

interface menuItemArgs {
  purchase: Purchase;
  structure?: StructureType;
  onSelect: (purchase: Purchase) => void;
}

function MenuItem({ purchase, structure, onSelect }: menuItemArgs) {
  return (
    <div
      onClick={() => {
        structure !==
          undefined ? onSelect(structureTypeToPurchase(structure)!) : onSelect(Purchase.DevCard)
      }}
      className="buyMenuItem"
    >
      <div>{purchaseName(purchase)}</div>
    </div>
  )
}
