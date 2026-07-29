import diceOne from '../assets/diceOne.png'
import diceTwo from '../assets/diceTwo.png'
import diceThree from '../assets/diceThree.png'
import diceFour from '../assets/diceFour.png'
import diceFive from '../assets/diceFive.png'
import diceSix from '../assets/diceSix.png'
import { useEffect, useRef, useState } from 'react'
import { getRandomInt } from 'notcatan-shared'

const dicePaths = [diceOne, diceTwo, diceThree, diceFour, diceFive, diceSix];
interface diceArgs {
  shouldRoll: boolean;
  setRoll?: [number, number] | null;
  onFinishedRolling: (values: [number, number]) => void;
}

export function Dice({ shouldRoll, onFinishedRolling, setRoll }: diceArgs) {
  const [dOne, setDOne] = useState(dicePaths[getRandomInt(0, 6)]);
  const [dTwo, setDTwo] = useState(dicePaths[getRandomInt(0, 6)]);
  const rollCount = useRef(0);

  useEffect(() => {
    if (!shouldRoll) return;
    const interval = setInterval(() => {
      setDOne(dicePaths[getRandomInt(0, 6)]);
      setDTwo(dicePaths[getRandomInt(0, 6)]);
      rollCount.current += 1;
      if (rollCount.current > 10) {
        let one: number;
        let two: number;
        if (setRoll == null) {
          one = getRandomInt(1, 7);
          two = getRandomInt(1, 7);
        } else {
          one = setRoll[0];
          two = setRoll[1];
        }
        setDOne(dicePaths[one - 1]);
        setDTwo(dicePaths[two - 1]);
        onFinishedRolling([one, two]);
        clearInterval(interval);
        rollCount.current = 0;
        return;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [shouldRoll]);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '10px',
    }}>
      <img src={dOne} style={{
        border: '2px solid black'
      }} />
      <img src={dTwo} style={{
        border: '2px solid black'
      }} />
    </div >
  )
}
