import { getGameData } from "../../lib/game/gameActions";
import GameClient from "./GameClient";

export default async function GamePage() {
  // This runs on the server
  const initialGameData = await getGameData();
  
  return <GameClient initialGameData={initialGameData} />;
} 