import { Colour, type Edge, getPort, getStructure, getTile, getVertice, type Player, type Port, Resource, type Structure, StructureType, type Tile, type Vertice } from 'notcatan-shared';
import type { Game } from 'notcatan-shared'
import '../styles/board.css'
import { useAppContext } from "../App";

export const brickcolour = [222, 112, 104];
export const woodcolour = [0, 125, 33];
export const sheepcolour = [127, 245, 141];
export const orecolour = [103, 115, 111];
export const wheatcolour = [207, 204, 104];
export const desertcolour = [245, 234, 184];
export const selectedColour = [242, 63, 227];

export const bluePlayer = [7, 68, 224];
export const whitePlayer = [250, 250, 250];
export const orangePlayer = [255, 117, 18];
export const redPlayer = [224, 11, 11];

export function getStructureColour(structure: Structure) {
  if (structure) {
    if (structure.colour == Colour.Blue) {
      return bluePlayer;
    }
    if (structure.colour == Colour.Orange) {
      return orangePlayer;
    }
    if (structure.colour == Colour.Red) {
      return redPlayer;
    }
    if (structure.colour == Colour.White) {
      return whitePlayer;
    }
  }
}
export function getPlayerColour(player: Player) {
  if (player.colour == Colour.Blue) {
    return bluePlayer;
  }
  if (player.colour == Colour.Orange) {
    return orangePlayer;
  }
  if (player.colour == Colour.Red) {
    return redPlayer;
  }
  if (player.colour == Colour.White) {
    return whitePlayer;
  }
}
export function getResourceColour(resource: Resource) {
  if (resource == Resource.Brick) {
    return brickcolour;
  }
  if (resource == Resource.Sheep) {
    return sheepcolour;
  }
  if (resource == Resource.Wheat) {
    return wheatcolour;
  }
  if (resource == Resource.Wood) {
    return woodcolour;
  }
  if (resource == Resource.Ore) {
    return orecolour;
  }
}
function getEdgePosFromVertices(edge: Edge, game: Game) {
  const v1 = getVertice(edge.verticeIds[0], game)!;
  const v2 = getVertice(edge.verticeIds[1], game)!;

  return {
    x: (v1.xPos + v2.xPos) / 2,
    y: (v1.yPos + v2.yPos) / 2,
    angleDeg: Math.atan2(v2.yPos - v1.yPos, v2.xPos - v1.xPos) * (180 / Math.PI),
  }
}
function getPortDrawPos(edge: Edge, tile: Tile, game: Game) {
  const offsetDistance = 20;
  const v1 = getVertice(edge.verticeIds[0], game)!;
  const v2 = getVertice(edge.verticeIds[1], game)!;
  const midX = (v1.xPos + v2.xPos) / 2;
  const midY = (v1.yPos + v2.yPos) / 2;

  // use the owning tile's center, not the board's center
  const dx = midX - tile.xPos;
  const dy = midY - tile.yPos;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dirX = dx / dist;
  const dirY = dy / dist;

  return {
    x: midX + dirX * offsetDistance,
    y: midY + dirY * offsetDistance,
    angleDeg: Math.atan2(dirY, dirX) * (180 / Math.PI) + 90,
  };
}
// function getPortColour(port: Port) {
//   switch (port.resource) {
//     case Resource.Brick: return 'red';
//     case Resource.Wood: return 'green';
//     case Resource.Sheep: return 'white';
//     case Resource.Ore: return 'black';
//     case Resource.Wheat: return 'yellow';
//     default: return 'pink';
//   }
// }
function colourFromResource(resource: Resource) {
  switch (resource) {
    case Resource.Brick: return brickcolour;
    case Resource.Wood: return woodcolour;
    case Resource.Ore: return orecolour;
    case Resource.Wheat: return wheatcolour;
    case Resource.Sheep: return sheepcolour;
    default: return desertcolour;
  }
}
interface BoardProps {
  game: Game;
  onPurchase: (item: Edge | Vertice) => void;
  onPlaceRobber: (id: number) => void;
}
export function Board({ game, onPurchase, onPlaceRobber }: BoardProps) {
  const containerWidth = 650;
  const containerHeight = 550;
  const tileCenterX = containerWidth / 2;
  const tileCenterY = containerHeight / 2;
  return (
    <div className="boardWrapper">
      <div
        className="tileContainer"
      >
        {game.tiles && (game.tiles.map((t) => (
          <DrawTile
            onPlaceRobber={onPlaceRobber}
            centerX={tileCenterX}
            centerY={tileCenterY}
            key={t.id}
            tile={t} />
        )))}
        {game.edges && (game.edges.map((e) => (
          <DrawEdge
            onClick={onPurchase}
            centerX={tileCenterX}
            centerY={tileCenterY}
            key={e.id}
            edge={e} />
        )))}
        {game.vertices && (game.vertices.map((e) => (
          <DrawVertex
            onClick={onPurchase}
            centerX={tileCenterX}
            centerY={tileCenterY}
            key={e.id}
            vertex={e} />
        )))}
      </div>
    </div>
  )
}

export function Header() {
  const { game } = useAppContext();

  return (
    <div>{game?.gameState}</div>
  )
}
interface tileProps {
  tile: Tile,
  centerX: number,
  centerY: number,
  onPlaceRobber: (id: number) => void;
}
function DrawTile({ tile, centerX, centerY, onPlaceRobber }: tileProps) {
  let colour = colourFromResource(tile.resource);
  let number = (() => {
    if (tile.robber) {
      return "R";
    } else if (tile.value == -1) {
      return "";
    } else {
      return tile.value;
    }
  })();
  let numberStyle = (number == 6 || number == 8) ? { color: "firebrick" } as React.CSSProperties : { color: 'black' } as React.CSSProperties;

  let classname = tile.highlighted ? "circleHighlighted" : "circle";
  return (
    <div
      className="hexagon"
      style={{
        left: tile.xPos + centerX - 50,
        background: `rgb(${colour![0]},${colour![1]},${colour![2]} )`,
        top: tile.yPos + centerY - 50,
      }}
    >
      {number && (
        <div
          onClick={() => tile.highlighted ? onPlaceRobber(tile.id) : null}
          className={classname}
          style={{
            fontWeight: 'bold',
            fontSize: '22px',
            paddingTop: '2px'
          }}
        >
          <div style={numberStyle}>{number}</div>
        </div>
      )}
    </div>
  )
}
interface vertexProps {
  vertex: Vertice,
  centerX: number,
  centerY: number,
  onClick: (id: Vertice | Edge) => void,
}
function DrawVertex({ vertex, centerX, centerY, onClick }: vertexProps) {
  const { game } = useAppContext();
  const structure = getStructure(vertex.structureId, game!);
  const backgroundColour = structure ? getStructureColour(structure) :
    vertex.highlighted ? selectedColour : 'none';
  const hasBulding = structure ? true : false;
  const shouldDraw = (structure || vertex.highlighted) ? true : false;
  let classname = "";
  let style;
  if (hasBulding) {
    if (structure!.type == StructureType.Settlement) {
      classname = "settlement"
    } else {
      classname = "city"
    }
    style = {
      backgroundColor: `rgb(${backgroundColour![0]},${backgroundColour![1]},${backgroundColour![2]} )`,
      left: vertex.xPos + centerX,
      top: vertex.yPos + centerY + 6,
      transform: `translate(-50%, -50%)`,
      fontSize: '10px',
    } as React.CSSProperties
  }

  if (vertex.highlighted) {
    classname = "vertexHighlighted";
    style = {
      left: vertex.xPos + centerX,
      top: vertex.yPos + centerY + 6,
      transform: `translate(-50%, -50%)`,
      fontSize: '10px',
    } as React.CSSProperties
  }
  return (
    <>
      {shouldDraw && (
        <div
          className={classname}
          style={style}
          onClick={() => { vertex.highlighted ? onClick(vertex) : null }}
        >
        </div>
      )}
    </>
  )
}
interface edgeProps {
  edge: Edge,
  centerX: number,
  centerY: number,
  onClick: (id: Vertice | Edge) => void,
}
function DrawEdge({ centerX, centerY, edge, onClick }: edgeProps) {
  const { game } = useAppContext();
  const { x: edgeX, y: edgeY, angleDeg: edgeAngleDeg } = getEdgePosFromVertices(edge, game!)
  const vert1 = getVertice(edge.verticeIds[0], game!)!;
  const vert2 = getVertice(edge.verticeIds[1], game!)!;
  let portX, portY, portAngleDeg;
  let port;
  let shouldDraw = (edge.structureId !== -1 || edge.highlighted) ? true : false;
  const backgroundColour = edge.structureId !== -1 ? getStructureColour(getStructure(edge.structureId, game!)!) : undefined;
  let hasPort = false;
  let portColour = [0, 0, 0];

  if (vert1.portId !== -1 && vert2.portId !== -1) {
    if (vert1.portId == vert2.portId) {
      const p = getPort(vert1.portId, game!)!;
      port = p;
      let commonTileId: number = -1;
      vert1.tileIds.forEach((t) => (
        vert2.tileIds.forEach((t2) => {
          if (t == t2) {
            commonTileId = t;
          }
        })
      ))
      const commonTile = getTile(commonTileId, game!)!;
      const { x, y, angleDeg } = getPortDrawPos(edge, commonTile!, game!);
      portX = x;
      portY = y;
      portAngleDeg = angleDeg
      hasPort = true;
      portColour = colourFromResource(p.resource);
    }
  }
  return (
    <>
      {shouldDraw && (
        <div
          onClick={() => {
            edge.highlighted ? onClick(edge) : null;
          }}
          className="edge"
          style={{
            background: backgroundColour ? `rgb(${backgroundColour![0]},${backgroundColour![1]},${backgroundColour![2]} )` : 'none',
            left: edgeX + centerX,
            top: edgeY + centerY + 6,
            transform: `translate(-50%, -50%) rotate(${edgeAngleDeg}deg)`,
            fontSize: '20px',
          }}
        >{ }</div>
      )}
      {hasPort && (
        <>
          <div
            className="portOutline"
            style={{
              left: portX! + centerX,
              top: portY! + centerY + 6,
              transform: `translate(-50%, -50%) rotate(${portAngleDeg}deg)`,
              fontSize: '10px',
            }}
          >
          </div>
          <div
            className="port"
            style={{
              background: portColour ? `rgb(${portColour![0]},${portColour![1]},${portColour![2]} )` : 'none',
              left: portX! + centerX,
              top: portY! + centerY + 6,
              transform: `translate(-50%, -50%) rotate(${portAngleDeg}deg)`,
              fontSize: '10px',
            }}
          >
            <div
              style={{
                fontWeight: 'bold'
              }}
            >{port!.rate} : 1</div>
          </div>
        </>
      )
      }
    </>
  )
}



