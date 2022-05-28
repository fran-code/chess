import './App.css';
import React from "react"

const initialValues = {
  size: 0,
  moves: 0
}

const initialStartGame: IStartGame = {
  initialPosition: undefined,
  showBoard: false,
  showResult: false
}

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

interface IInputForm {
  state: IState;
  setState: Function;
}

const InputForm: React.FC<IInputForm> = ({ state, setState }) => {

  const onChange = (e: any) => {
    const { name, value } = e.target
    setState({ ...state, [name]: Number(value) })
  }

  return (
    <div className='formChess'>
      <p>
        <label htmlFor='size'>Size: </label>
        <input name="size" type="number" onChange={onChange} value={state.size} />
      </p>
      <p>
        <label htmlFor='moves'>Movements number: </label>
        <input name="moves" type="number" onChange={onChange} value={state.moves} />
      </p>
    </div>
  )
}

interface IBoard {
  state: IState;
  allPositions: number[][];
}

const Board: React.FC<IBoard> = ({ state, allPositions }) => {

  if (!allPositions.length) return <></>

  return (
    <div className='board'>
      {
        Array.from(Array(state.size).keys()).reverse().map(indexY => {
          return (
            <div key={indexY}>
              {Array(state.size).fill(1).map((i, indexX) => {
                const lastPosition = allPositions[allPositions.length - 1]
                const color = lastPosition[0] === indexX && lastPosition[1] === indexY ? "yellow" : "lightgray"
                return (
                  <button key={indexX} style={{ width: "25px", height: "25px", backgroundColor: color }} />
                )
              })}
            </div>
          )
        })
      }
    </div>
  )
}

const useListenKeys = (initialPosition: undefined | number[], size: number) => {
  const [positions, setPositions] = React.useState<number[][]>([])

  React.useEffect(() => {
    if (initialPosition) setPositions([...positions, initialPosition])
  }, [initialPosition])

  const handleUserKeyPress = (eventKey: any) => {
    const { keyCode } = eventKey;
    const lastPosition = positions[positions.length - 1]
    if (initialPosition && [37, 38, 39, 40].includes(keyCode)) {
      let newPosition = lastPosition
      switch (keyCode) {
        case 37:
          if (lastPosition[0] > 0) newPosition = [lastPosition[0] - 1, lastPosition[1]]
          break;
        case 38:
          if (lastPosition[1] < size - 1) newPosition = [lastPosition[0], lastPosition[1] + 1]
          break;
        case 39:
          if (lastPosition[0] < size - 1) newPosition = [lastPosition[0] + 1, lastPosition[1]]
          break;
        case 40:
          if (lastPosition[1] > 0) newPosition = [lastPosition[0], lastPosition[1] - 1]
          break;
        default:
          break;
      }
      setPositions([...positions, newPosition])
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  return [positions]
}

interface IState {
  size: number;
  moves: number;
}

interface IStartGame {
  initialPosition: undefined | number[];
  showBoard: boolean;
  showResult: boolean;
}

const reducerStateGame = (state: IStartGame, action: { type: string, payload?: any }): IStartGame => {
  switch (action.type) {
    case "ready":
      return { ...state, showBoard: true, showResult: false, initialPosition: action.payload }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }
}

interface IFinish {
  allPositions: number[][]
}

const Finish: React.FC<IFinish> = ({ allPositions }) => {
  return (
    <div>
      <div className='thankYou'>Thank you! Your steps:</div>
      <div className='positions'>{JSON.stringify(allPositions)}</div>
    </div>
  )
}

const App: React.FC = () => {
  const [state, setState] = React.useState<IState>(initialValues)
  const [startGame, dispatch] = React.useReducer(reducerStateGame, initialStartGame)
  const [allPositions] = useListenKeys(startGame.initialPosition, state.size)

  const actionButton = () => {
    dispatch({
      type: "ready",
      payload: [randomIntFromInterval(0, state.size - 1), randomIntFromInterval(0, state.size - 1)]
    })
  }

  const isFinish = allPositions.length > state.moves

  return (
    <div className='chessContainer'>
      <InputForm state={state} setState={setState} />
      <div className="okButton">
        <button disabled={state.moves < 1 || state.size < 1 || isFinish} onClick={actionButton}>OK</button>
      </div>
      {
        isFinish ?
          <Finish allPositions={allPositions} />
          :
          startGame.showBoard && <Board state={state} allPositions={allPositions} />
      }
    </div >
  );
}

export default App;
