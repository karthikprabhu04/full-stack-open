import { useState } from 'react'

const StatisticLine = (props) => {
  return (
    <tr>
      <td>{props.text}</td>
      <td>{props.value}</td>
    </tr>
  )
}

const Statistics = ({good, neutral, bad}) => {
  const all = good + neutral + bad
  const average = (good - bad) / all
  const positive = (good * 100) / all
  if (all === 0) {
    return (
      <div>
        <p>No feedback given</p>
      </div>
    )
  }

  return (
    <div>
      <table>
        <tbody>
          <StatisticLine text="good" value={good}/>
          <StatisticLine text="neutral" value={neutral}/>
          <StatisticLine text="bad" value={bad}/>
          <StatisticLine text="average" value={isNaN(average) ? 0 : average}/>
          <StatisticLine text="positive" value={isNaN(positive) ? 0 : positive + "%"}/>
        </tbody>
      </table>
    </div>
  )
}

const Button = (props) => {
  return (
    <>
      <button onClick={() => props.setter(props.count + 1)}>{props.text}</button>
    </>
  )
}

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>
      <Button setter={setGood} text="good" count={good}/>
      <Button setter={setNeutral} text="neutral" count={neutral}/>
      <Button setter={setBad} text="bad" count={bad}/>

      <h1>statistics</h1>
      <Statistics good={good} neutral={neutral} bad={bad}/>
    </div>
  )
}

export default App