import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/log" element={<Login />} />
          <Route path="/db" element={<Layout />}>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}
