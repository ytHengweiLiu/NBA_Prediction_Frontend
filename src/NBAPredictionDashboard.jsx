import React, { useState } from 'react'
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
import NBANewsFeed from './NBANewsFeed.jsx'

const NBAPredictionDashboard = () => {
  const [team1, setTeam1] = useState('Los Angeles Lakers')
  const [team2, setTeam2] = useState('Cleveland Cavaliers')
  const [isLoading, setIsLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [error, setError] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [selectedTab, setSelectedTab] = useState('prediction')
  const [homeTeam, setHomeTeam] = useState(0) // 0 = neutral, 1 = team1 is home, 2 = team2 is home

  const COLLECT_URL = 'https://yetriidc3m.execute-api.us-east-1.amazonaws.com/default/nba-collection-lambda-v2'
  const ANALYSE_URL = 'https://1pka1875p6.execute-api.us-east-1.amazonaws.com/default/nba-analyse-lambda-v2'

  // // Initialize with a sample prediction
  // useEffect(() => {
  //   if (team1 && team2) {
  //     handlePrediction()
  //   }
  // }, [])

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
      // Home court advantage: 1 if team1 is home, 0 if team2 is home
      const homeValue = homeTeam === 1 ? 1 : 0
      const COLLECT_PARAMS = {
        team1: NBAConstants.TEAM_ABBR[team1],
        team2: NBAConstants.TEAM_ABBR[team2],
      }
      const ANALYSE_PARAMS = {
        team1: NBAConstants.TEAM_ABBR[team1],
        team2: NBAConstants.TEAM_ABBR[team2],
        home: homeValue
      }

      const COLLECT_API_URL = new URL(COLLECT_URL)
      Object.keys(COLLECT_PARAMS).forEach(key => {
        COLLECT_API_URL.searchParams.append(key, COLLECT_PARAMS[key])
      })
      console.log('COLLECT_API_URL:', COLLECT_API_URL.toString())

      const collect_response = await axios.post(
        COLLECT_API_URL,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      console.log('Response:', JSON.stringify(collect_response.data, null, 4))

      if (collect_response.status !== 200) {
        throw new Error('API request failed')
      }
      console.log('COLLECT Result: ', collect_response.data)

      const ANALYSE_API_URL = new URL(ANALYSE_URL)
      Object.keys(ANALYSE_PARAMS).forEach(key => {
        ANALYSE_API_URL.searchParams.append(key, ANALYSE_PARAMS[key])
      })
      console.log('ANALYSE_API_URL:', ANALYSE_API_URL.toString())

      const response = await axios.post(
        ANALYSE_API_URL,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      console.log('Response:', JSON.stringify(response.data, null, 4))

      if (response.status !== 200) {
        throw new Error('API request failed')
      }

      const result = await response.data

      console.log('Result: ', result)
      setPredictionResult(result)

      // Add to recent predictions
      // const newPrediction = {
      //   id: Date.now(),
      //   team1,
      //   team2,
      //   result: result.analysis.winProbabilities,
      //   timestamp: result.analysis.analysisTimestamp
      // }
      const resultData = { ...result, team1, team2 }
      setRecentPredictions(prev => [resultData, ...prev].slice(0, 5))
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
    if (!predictionResult) return [];

    return [
      { name: team1, value: predictionResult.winning_rate * 100 },
      { name: team2, value: (1 - predictionResult.winning_rate) * 100 }
    ];
  };

  const formatProbability = value => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getPredictionDescription = () => {
    if (!predictionResult) return '';

    const diff = Math.abs(predictionResult.winning_rate - 0.5);

    if (diff < 0.1) {
      return 'This looks like a very close matchup. Either team could win this game.';
    } else if (predictionResult.winning_rate > 0.5) {
      return `${team1} is predicted to win with a winning rate of ${(predictionResult.winning_rate * 100).toFixed(1)}%.`;
    } else {
      return `${team2} is predicted to win with a winning rate of ${((1 - predictionResult.winning_rate) * 100).toFixed(1)}%.`;
    }
  };

  const favouredTeam = predictionResult
    ? (predictionResult.winning_rate >= 0.5 ? team1 : team2)
    : '';


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

      {/* Home Court Advantage Selection */}
      <div className='bg-gray-800 rounded-lg p-4 border border-gray-700'>
        <h3 className='text-lg font-medium text-gray-200'>Home Court Advantage</h3>
        <div className='flex flex-col space-y-3'>
          <label className='flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer'>
            <input
              type='radio'
              name='homeTeam'
              checked={homeTeam === 1}
              onChange={() => setHomeTeam(1)}
              className='form-radio text-blue-500'
            />
            <span className='text-gray-300'>{team1} has home court advantage</span>
          </label>
          <label className='flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer'>
            <input
              type='radio'
              name='homeTeam'
              checked={homeTeam === 2}
              onChange={() => setHomeTeam(0)}
              className='form-radio text-blue-500'
            />
            <span className='text-gray-300'>{team2} has home court advantage</span>
          </label>
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
        <div className='bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700'>
          <div className='p-6 bg-blue-900'>
            <h3 className='text-2xl font-bold text-white mb-1'>
              Prediction Results
            </h3>
            <p className='text-gray-300 flex items-center'>
              <Clock className='mr-2' size={16} />
              {new Date(predictionResult.timestamp).toLocaleString()}
            </p>
          </div>

          <div className='p-6 space-y-8'>
            <div className='grid md:grid-cols-2 gap-8'>
              <div className='space-y-5'>
                <h4 className='text-xl font-medium text-gray-200 flex items-center'>
                  <TrendingUp className='mr-2 text-blue-400' size={20} />
                  Win Probability
                </h4>
                <div className='h-64 bg-gray-850 rounded-lg p-4'>
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={NBAConstants.TEAM_COLORS[entry.name] || '#8884d8'}
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
                  <h4 className='text-xl font-medium text-gray-200 mb-4 flex items-center'>
                    <AlertCircle className='mr-2 text-blue-400' size={20} />
                    Analysis Summary
                  </h4>
                  <div className='bg-gray-700 rounded-lg p-5'>
                    <p className='text-gray-300'>{getPredictionDescription()}</p>
                  </div>
                </div>

                <div className='space-y-5'>
                  <div className='bg-gray-750 rounded-lg p-5'>
                    <div className='flex justify-between text-sm text-gray-400 mb-2'>
                      <span className='font-medium'>{team1}</span>
                      <span className='font-medium'>{team2}</span>
                    </div>
                    <div className='w-full bg-gray-600 rounded-full h-7 overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-700 ease-in-out'
                        style={{
                          width: `${predictionResult.winning_rate * 100}%`,
                          backgroundColor: NBAConstants.TEAM_COLORS[team1] || '#3B82F6'
                        }}
                      />
                    </div>
                    <div className='flex justify-between mt-3 font-bold'>
                      <span className='text-white'>
                        {formatProbability(predictionResult.winning_rate)}
                      </span>
                      <span className='text-white'>
                        {formatProbability((1 - predictionResult.winning_rate))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row with Model Accuracy and Favoured Team side by side */}
            <div className='grid md:grid-cols-2 gap-8'>
              <div className='bg-gray-700 rounded-lg p-4 flex items-center justify-between'>
                <div className='flex items-center'>
                  <Activity className='text-blue-400 mr-2' size={24} />
                  <span className='text-lg font-medium text-white'>Model Accuracy</span>
                </div>
                <span className='text-lg font-bold text-blue-400'>
                  {predictionResult.model_accuracy ?
                    `${(predictionResult.model_accuracy * 100).toFixed(1)}%` :
                    'Not available'}
                </span>
              </div>

              <div className='bg-gray-700 rounded-lg p-4 flex items-center justify-between'>
                <div className='flex items-center'>
                  <Award className='text-yellow-400 mr-2' size={24} />
                  <span className='text-lg font-medium text-white'>Favoured Team</span>
                </div>
                <span
                  className='text-lg font-bold'
                  style={{
                    color: 'white' 
                    // || NBAConstants.TEAM_COLORS[favouredTeam]
                  }}
                >
                  {favouredTeam}
                </span>
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
                        width: `${prediction.winning_rate * 100}%`,
                        backgroundColor:
                          NBAConstants.TEAM_COLORS[prediction.team1] ||
                          '#3B82F6'
                      }}
                    />
                  </div>

                  <div className='flex justify-between mt-2 text-sm'>
                    <span className='text-white'>
                      {prediction.team1}:{' '}
                      {formatProbability(prediction.winning_rate)}
                    </span>
                    <span className='text-white'>
                      {prediction.team2}:{' '}
                      {formatProbability(1 - prediction.winning_rate)}
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
              className={`py-3 px-6 font-medium flex items-center ${selectedTab === 'prediction'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
                }`}
              onClick={() => setSelectedTab('prediction')}
            >
              <TrendingUp className='mr-2' size={20} />
              Prediction
            </button>
            <button
              className={`py-3 px-6 font-medium flex items-center ${selectedTab === 'history'
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
          <div className="mt-8">
            <NBANewsFeed />
          </div>
        </main>

        <footer className='mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm'>
          <p>© 2025 NBA Team Prediction</p>
        </footer>
      </div>
    </div>
  )
}

export default NBAPredictionDashboard
