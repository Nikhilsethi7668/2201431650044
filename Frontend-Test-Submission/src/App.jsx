import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout/Layout'
import Form from './Components/Form'
import Analytics from './Components/Analytics'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Form />} />
          <Route path="/analytics" element={<Analytics />} />

        </Route>
      </Routes>

    </>
  )
}

export default App
