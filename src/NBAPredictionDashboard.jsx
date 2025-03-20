import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Loader,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Activity
} from 'lucide-react'
import * as NBAConstants from './NBAConstants.tsx'

const NBAPredictionDashboard = () => {
  const [team1, setTeam1] = useState('Cleveland')
  const [team2, setTeam2] = useState('Memphis')
  const [isLoading, setIsLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [error, setError] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [selectedTab, setSelectedTab] = useState('prediction')

  const ANALYSE_API_URL = 
  // '/dev/analyse-dev/'
  'https://j25ls96ohb.execute-api.us-east-1.amazonaws.com/dev/analyse-dev/'

  // Initialize with a sample prediction
  useEffect(() => {
    if (team1 && team2) {
      handlePrediction()
    }
  }, [])

  const handlePrediction = async () => {
    if (!team1 || !team2) {
      setError('Please select both teams')
      return
    }

    if (team1 === team2) {
      setError('Please select two different teams')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Real API call
      // const response = await fetch('https://your-api.com/predict', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ team1, team2 })
      // })

      const response = await axios.post(
        ANALYSE_API_URL,
        { team1, team2 },
        {
          headers: {
            'Content-Type': 'application/json'
          }
          // headers: {
          //   'Content-Type': 'application/json',
          //   'Access-Control-Allow-Headers':
          //     'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          //   'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          //   'Access-Control-Allow-Origin': '*'
          // }
        }
      )
      console.log('Response:', JSON.stringify(response.data, null, 4))

      if (response.status !== 200) {
        throw new Error('API request failed')
      }

      const result = await response.data

      // const result = {
      //   analysis: {
      //     winProbabilities: {
      //       [team1]: '12%',
      //       [team2]: '78%'
      //     },
      //     analysisTimestamp: new Date().toISOString()
      //   }
      // }
      console.log('Result: ', result)
      setPredictionResult(result)

      // Add to recent predictions
      const newPrediction = {
        id: Date.now(),
        team1,
        team2,
        result: result.analysis.winProbabilities,
        timestamp: result.analysis.analysisTimestamp
      }

      setRecentPredictions(prev => [newPrediction, ...prev].slice(0, 5))
    } catch (err) {
      if (err.response) {
        // Server responded with an error status code
        console.error('Error response data:', err.response.data)
        console.error('Error response status:', err.response.status)
        setError(
          `Server error: ${err.response.status}. Please try again later.`
        )
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request)
        setError('No response from server. Please check your connection.')
      } else {
        // Error setting up the request
        console.error('Error message:', err.message)
        setError(`Error: ${err.message}`)
      }
      setError('Error fetching prediction. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  const getPieChartData = () => {
    if (!predictionResult) return []

    const { winProbabilities } = predictionResult.analysis
    console.log('winProbabilities: ', winProbabilities)
    console.log(team1, team2)
    console.log(
      { name: team1, value: parseFloat(winProbabilities[team1]) * 100 },
      { name: team2, value: parseFloat(winProbabilities[team2]) * 100 }
    )
    return [
      { name: team1, value: parseFloat(winProbabilities[team1]) * 100 },
      { name: team2, value: parseFloat(winProbabilities[team2]) * 100 }
    ]
  }

  const formatProbability = value => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getPredictionDescription = () => {
    if (!predictionResult) return ''

    const { winProbabilities } = predictionResult.analysis
    const team1Prob = winProbabilities[team1]
    const team2Prob = winProbabilities[team2]

    if (Math.abs(team1Prob - team2Prob) < 0.1) {
      return 'This looks like a very close matchup. Either team could win this game.'
    } else if (team1Prob > team2Prob) {
      return `${team1} has a significant advantage over ${team2} and is favoured to win.`
    } else {
      return `${team2} has a significant advantage over ${team1} and is favoured to win.`
    }
  }

  const renderPredictionContent = () => (
    <div className='space-y-8'>
      {/* Team Selection */}
      <div className='grid md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label htmlFor='team1' className='text-lg font-medium text-gray-200'>
            Team 1
          </label>
          <select
            id='team1'
            value={team1}
            onChange={e => setTeam1(e.target.value)}
            className='w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white'
          >
            <option value=''>Select Team 1</option>
            {NBAConstants.NBA_TEAMS.map(team => (
              <option key={`t1-${team}`} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-2'>
          <label htmlFor='team2' className='text-lg font-medium text-gray-200'>
            Team 2
          </label>
          <select
            id='team2'
            value={team2}
            onChange={e => setTeam2(e.target.value)}
            className='w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white'
          >
            <option value=''>Select Team 2</option>
            {NBAConstants.NBA_TEAMS.map(team => (
              <option key={`t2-${team}`} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handlePrediction}
        disabled={isLoading}
        className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition flex items-center justify-center'
      >
        {isLoading ? (
          <>
            <Loader className='animate-spin mr-2' size={20} />
            Analysing Teams...
          </>
        ) : (
          'Get Prediction'
        )}
      </button>

      {error && (
        <div className='p-4 bg-red-900/50 border border-red-800 rounded-lg text-white flex items-center'>
          <AlertCircle className='mr-2' size={20} />
          {error}
        </div>
      )}

      {/* Prediction Results */}
      {predictionResult && (
        <div className='bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
          <div className='p-6 bg-blue-900'>
            <h3 className='text-2xl font-bold text-white mb-1'>
              Prediction Results
            </h3>
            <p className='text-gray-300'>
              <Clock className='inline mr-1' size={16} />
              {new Date(
                predictionResult.analysis.analysisTimestamp
              ).toLocaleString()}
            </p>
          </div>

          <div className='p-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h4 className='text-xl font-medium text-gray-200'>
                  Win Probability
                </h4>
                <div className='h-64'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              NBAConstants.TEAM_COLORS[entry.name] || '#8884d8'
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => `${value.toFixed(1)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className='space-y-6'>
                <div>
                  <h4 className='text-xl font-medium text-gray-200 mb-4'>
                    Analysis Summary
                  </h4>
                  <p className='text-gray-300'>{getPredictionDescription()}</p>
                </div>

                <div className='space-y-4'>
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <div className='flex justify-between text-sm text-gray-400 mb-1'>
                      <span>{team1}</span>
                      <span>{team2}</span>
                    </div>
                    <div className='w-full bg-gray-600 rounded-full h-6 overflow-hidden'>
                      <div
                        className='h-full rounded-full'
                        style={{
                          width: `${
                            predictionResult.analysis.winProbabilities[team1] *
                            100
                          }%`,
                          backgroundColor:
                            NBAConstants.TEAM_COLORS[team1] || '#3B82F6'
                        }}
                      />
                    </div>
                    <div className='flex justify-between mt-1 font-bold'>
                      <span>
                        {formatProbability(
                          predictionResult.analysis.winProbabilities[team1]
                        )}
                      </span>
                      <span>
                        {formatProbability(
                          predictionResult.analysis.winProbabilities[team2]
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='bg-gray-700 rounded-lg p-4 flex items-center justify-between'>
                    <div className='flex items-center'>
                      <Award className='text-yellow-400 mr-2' size={24} />
                      <span className='text-lg font-medium text-white'>
                        Favoured Team
                      </span>
                    </div>
                    <span
                      className='text-lg font-bold'
                      style={{
                        color:
                          NBAConstants.TEAM_COLORS[
                            predictionResult.analysis.winProbabilities[team1] >
                            predictionResult.analysis.winProbabilities[team2]
                              ? team1
                              : team2
                          ] || 'white'
                      }}
                    >
                      {predictionResult.analysis.winProbabilities[team1] >
                      predictionResult.analysis.winProbabilities[team2]
                        ? team1
                        : team2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderHistoryContent = () => (
    <div className='space-y-8'>
      <div className='bg-gray-800 rounded-lg shadow-lg overflow-hidden'>
        <div className='p-6 bg-gradient-to-r from-amber-900 to-orange-900'>
          <h3 className='text-2xl font-bold text-white'>Recent Predictions</h3>
          <p className='text-gray-300'>Your most recent team analyses</p>
        </div>

        <div className='p-6'>
          {recentPredictions.length === 0 ? (
            <div className='text-center py-8 text-gray-400'>
              <p>No prediction history yet. Make your first prediction!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {recentPredictions.map(prediction => (
                <div
                  key={prediction.id}
                  className='bg-gray-700 p-4 rounded-lg shadow'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center'>
                      <span className='font-medium text-white'>
                        {prediction.team1} vs {prediction.team2}
                      </span>
                    </div>
                    <span className='text-xs text-gray-400'>
                      {new Date(prediction.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className='w-full bg-gray-600 rounded-full h-4 overflow-hidden'>
                    <div
                      className='h-full rounded-full'
                      style={{
                        width: `${prediction.result[prediction.team1] * 100}%`,
                        backgroundColor:
                          NBAConstants.TEAM_COLORS[prediction.team1] ||
                          '#3B82F6'
                      }}
                    />
                  </div>

                  <div className='flex justify-between mt-2 text-sm'>
                    <span className='text-white'>
                      {prediction.team1}:{' '}
                      {formatProbability(prediction.result[prediction.team1])}
                    </span>
                    <span className='text-white'>
                      {prediction.team2}:{' '}
                      {formatProbability(prediction.result[prediction.team2])}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <header className='mb-8'>
          <div className='flex items-center justify-between'>
            <h1 className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500'>
              NBA Team Prediction
            </h1>
            <div className='text-sm text-gray-400'>Team BRAVO</div>
          </div>
          <p className='text-gray-400 mt-2 max-w-3xl'>
            Using team performance data and advanced analytics, our AI model
            predicts game outcomes with high accuracy. Select two teams to see
            which one has the statistical advantage.
          </p>
        </header>

        <main>
          <div className='flex border-b border-gray-700 mb-6'>
            <button
              className={`py-3 px-6 font-medium flex items-center ${
                selectedTab === 'prediction'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setSelectedTab('prediction')}
            >
              <TrendingUp className='mr-2' size={20} />
              Prediction
            </button>
            <button
              className={`py-3 px-6 font-medium flex items-center ${
                selectedTab === 'history'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setSelectedTab('history')}
            >
              <Activity className='mr-2' size={20} />
              Prediction History
            </button>
          </div>

          {selectedTab === 'prediction' && renderPredictionContent()}
          {selectedTab === 'history' && renderHistoryContent()}
        </main>

        <footer className='mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm'>
          <p>© 2025 NBA Team Prediction | Data updated daily</p>
        </footer>
      </div>
    </div>
  )
}

export default NBAPredictionDashboard
