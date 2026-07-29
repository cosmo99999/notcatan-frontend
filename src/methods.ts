import { deselectEdges, deselectVertices, getAllStructuresByPlayer, getEdge, getEdgeAdjacentEdges, getEdgesByList, getPlayer, getPort, getStructure, getVerticesByList, StructureType, type Edge, type Game, type Player, type Vertice } from "notcatan-shared";

// function contains(array: number[], value: number) {
//   if (array.some(v => v == value)) return true;
//   return false;
// }
// function overlaps(array: number[], array2: number[]) {
//   return array.some(a => array2.includes(a));
// }
// function isEdgeNearStructure(edge: Edge, game: Game): boolean {
//   let vertices = getVerticesByList(edge.verticeIds, game);
//   vertices.forEach((v) => {
//     if (v.structureId !== -1) {
//       return true;
//     }
//   })
//   return false;
// }
function isEdgeNearFriendlyStructure(edge: Edge, game: Game, pId: number): boolean {
  let vertices = getVerticesByList(edge.verticeIds, game);
  let result = false;
  vertices.forEach((v) => {
    const structure = getStructure(v.structureId, game);
    if (structure && structure.playerId == pId) {
      result = true;
    }
  })
  return result;
}
function isEdgeNearFriendlyRoad(edge: Edge, game: Game, pId: number): boolean {
  let edges = getEdgeAdjacentEdges(edge, game);
  let result = false;
  edges.forEach((e) => {
    const structure = getStructure(e.structureId, game);
    if (structure && structure.playerId == pId) {
      const sharedVertex: Vertice =
        game.vertices.find(v => v.edgeIds.find(ed => ed == edge.id) && v.edgeIds.find(ed => ed == e.id))!;
      if (sharedVertex) {
        const middleStructure = getStructure(sharedVertex.structureId, game)!;
        if (!(middleStructure && middleStructure.playerId !== pId)) {
          result = true;
        }
      } else {
        result = true;
      }
    }
  })
  return result;
}
function getVerticeAdjacentVertices(vertice: Vertice, game: Game): Vertice[] {
  const edges = getEdgesByList(vertice.edgeIds, game);
  const verticeIds: number[] = [];
  edges.forEach((v) => {
    v.verticeIds.forEach((e) => {
      verticeIds.push(e);
    })
  });
  const allVertices = getVerticesByList(verticeIds, game);
  return allVertices.filter(e => e.id !== vertice.id);
}
function VertexNeighbourHasStructure(vertex: Vertice, game: Game): boolean {
  const vertices = getVerticeAdjacentVertices(vertex, game);
  let found = false;
  vertices.forEach((v) => {
    if (v.structureId !== -1) {
      found = true;
    }
  })
  return found;
}
function VertexHasJoiningRoad(vertex: Vertice, player: Player, game: Game): boolean {
  let edges: Edge[] = getEdgesByList(vertex.edgeIds, game);
  let result = false;
  edges.forEach((e) => {
    const structure = getStructure(e.structureId, game)
    if (structure && structure.playerId == player.id) {
      result = true;
    }
  })
  return result;
}
function ValidSettlementPositions(game: Game, player: Player): number[] {
  const allVerts = [...game.vertices];
  const potential = allVerts.filter(v => !VertexNeighbourHasStructure(v, game) && v.structureId == -1);
  const structures = getAllStructuresByPlayer(player.id, game);
  const settlements = structures.filter(s => s.type == StructureType.Settlement).length;
  if (settlements < 2 || !settlements) {
    return potential.map(v => v.id);
  } else {
    return potential.filter(v => VertexHasJoiningRoad(v, player, game)).map(v => v.id);
  }
}
function ValidCityPosition(game: Game, player: Player): number[] {
  const allVerts = game.vertices;
  const validPositions: number[] = [];
  allVerts.forEach((v) => {
    const structure = getStructure(v.structureId, game);
    if (structure?.playerId == player.id) {
      if (structure && structure.type == StructureType.Settlement) {
        validPositions.push(v.id);
      }
    }
  })
  return validPositions;
}
function ValidRoadPosition(game: Game, player: Player, startRoad: boolean = false): number[] {
  if (!startRoad) {
    let allEdges = game.edges;
    const nearBuilding = allEdges.filter(e => isEdgeNearFriendlyStructure(e, game, player.id));
    const nearRoads = allEdges.filter(e => isEdgeNearFriendlyRoad(e, game, player.id));
    let result = [...nearBuilding, ...nearRoads];
    return result.map(e => e.id);
  } else {
    const lastStructureId: number = game.structures.sort((a, b) => b.id - a.id)[0].id;
    const vertex: Vertice = game.vertices.find(v => v.structureId == lastStructureId)!;
    const edges = getEdgesByList(vertex.edgeIds, game);
    return edges.map(e => e.id);
  }
}
export function HighlightBuildLocations(g: Game, me: Player, selection: StructureType, currentSelected: StructureType, startRoad: boolean = false): [Game, StructureType] {

  if (!g || !me) return [g, currentSelected];
  const game = structuredClone(g);
  let resultSelected: StructureType = StructureType.None;

  switch (selection) {
    case StructureType.Road: {
      if (currentSelected == StructureType.Road) {
        deselectEdges(game);
      } else {
        deselectVertices(game);
        const selectedIds = ValidRoadPosition(game, me, startRoad);
        game.edges = game.edges.map(e => {
          if (selectedIds.some(s => s == e.id)) {
            e.highlighted = true;
          }
          return e;
        })
        resultSelected = StructureType.Road;
      }
      break;
    }
    case StructureType.Settlement: {
      if (currentSelected == StructureType.Settlement) {
        deselectVertices(game);
      } else {
        deselectEdges(game);
        const selectedIds = ValidSettlementPositions(game, me);
        game.vertices = game.vertices.map(e => {
          if (selectedIds.some(s => s == e.id)) {
            e.highlighted = true;
          }
          return e;
        })
        resultSelected = StructureType.Settlement;
      }
      break;
    }
    case StructureType.City: {
      if (currentSelected == StructureType.City) {
        deselectVertices(game);
      } else {
        deselectEdges(game);
        const selectedIds = ValidCityPosition(game, me);
        game.vertices = game.vertices.map(e => {
          if (selectedIds.some(s => s == e.id)) {
            e.highlighted = true;
          }
          return e;
        })
        resultSelected = StructureType.City;
      }
    }
  }

  return [game, resultSelected]
}
export function ReselectRoadsForRoadBuilding(pId: number, g: Game): Game {
  const game = structuredClone(g);
  const selectedIds = ValidRoadPosition(game, getPlayer(pId, game)!);
  game.edges = game.edges.map(e => {
    if (selectedIds.some(s => s == e.id)) {
      e.highlighted = true;
    }
    return e;
  })
  return game;
}
export function RoadBuildingFreeRoad(eId: number, pId: number, g: Game): Game {
  let game = structuredClone(g);
  const player = getPlayer(pId, game)!;
  const edge = getEdge(eId, game)!;
  const building = {
    id: game.structureIdCounter++,
    colour: player.colour,
    type: StructureType.Road,
    playerId: player.id,
  }
  player.structureIds.push(building.id);
  game.structures.push(building);
  edge.structureId = building.id;

  return game;
}
export function selectTilesForRobber(g: Game): Game {
  const game = structuredClone(g);
  game.tiles.map((t) => {
    if (!t.robber) {
      t.highlighted = true;
    }
    return t;
  })
  return game;
}
export function deselectTilesForRobber(g: Game): Game {
  const game = structuredClone(g);
  game.tiles.map((t) => {
    t.highlighted = false;
    return t;
  })
  return game;
}


export function getPortsForPlayer(pId: number, game: Game) {
  const structures = game.structures.filter(s => s.playerId == pId && s.type !== StructureType.Road);
  const vertices: Vertice[] = game.vertices.filter(v => structures.some(st => st.id == v.structureId));
  const portIds = vertices.filter(v => v.portId !== -1).map(v => v.portId);
  const ports = portIds.map(v => getPort(v, game));
  return ports;
}




