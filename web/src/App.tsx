import { useState, useEffect } from 'react'

/**
 * Tipos de datos que provienen de la app móvil.
 */
interface GoalData {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

interface DepositData {
  id: string
  amount: number
  formattedAmount: string
  timestamp: string
}

function App() {
  const [goal, setGoal] = useState<GoalData | null>(null)
  const [deposits, setDeposits] = useState<DepositData[]>([])
  const [amount, setAmount] = useState('')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    // 1. Escuchar mensajes desde React Native (iOS)
    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.data)
        if (type === 'GOAL_DATA') setGoal(payload)
        if (type === 'DEPOSITS_DATA') setDeposits(payload)
      } catch (e) {
        console.error('Error parseando mensaje RN', e)
      }
    }

    // 2. Escuchar mensajes desde React Native (Android)
    const handleDocumentMessage = (event: Event) => {
      try {
        const messageEvent = event as MessageEvent
        const { type, payload } = JSON.parse(messageEvent.data)
        if (type === 'GOAL_DATA') setGoal(payload)
        if (type === 'DEPOSITS_DATA') setDeposits(payload)
      } catch (e) {
        console.error('Error parseando mensaje RN Android', e)
      }
    }

    window.addEventListener('message', handleMessage)
    document.addEventListener('message', handleDocumentMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      document.removeEventListener('message', handleDocumentMessage)
    }
  }, [])

  const sendToNative = (type: string, payload: any) => {
    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }))
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(val) && val > 0) {
      setAmount(val.toString())
      setPreview('$ ' + val.toLocaleString('es-CO'))
    } else {
      setAmount('')
      setPreview('')
    }
  }

  const handleDeposit = () => {
    const numAmount = parseInt(amount, 10)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Ingresa un monto válido')
      return
    }

    sendToNative('DEPOSIT_CONFIRMED', {
      amount: numAmount,
      formattedAmount: preview,
    })

    setAmount('')
    setPreview('')
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const percentage = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  )

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Resumen de la Meta */}
      <div className="glass rounded-2xl shadow-sm p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
        <h1 className="text-2xl font-bold text-gray-900 relative z-10">{goal.name}</h1>
        <div className="mt-6 relative z-10">
          <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
            <span className="text-emerald-600">${goal.currentAmount.toLocaleString('es-CO')}</span>
            <span>${goal.targetAmount.toLocaleString('es-CO')}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3.5 shadow-inner overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                percentage >= 100
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3 font-medium">
            {percentage >= 100 ? '🎉 ¡Meta completada!' : `${percentage}% completado`}
          </p>
        </div>
      </div>

      {/* Formulario de Abono */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💸</span> Realizar Abono
        </h2>
        <div className="flex gap-3">
          <input
            type="tel"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Ingresa el monto"
            className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
          <button
            onClick={handleDeposit}
            disabled={!amount}
            className="h-12 px-6 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 active:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/30"
          >
            Abonar
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-2 font-medium h-5">
          {preview}
        </p>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Historial de Abonos
        </h2>
        <div className="space-y-4">
          {deposits.length === 0 ? (
            <div className="py-6 text-center">
              <span className="text-3xl block mb-2">🌱</span>
              <p className="text-gray-400 text-sm">Aún no hay abonos registrados.</p>
            </div>
          ) : (
            deposits.map((d, index) => (
              <div
                key={d.id}
                className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors -mx-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div>
                  <p className="font-semibold text-gray-900">{d.formattedAmount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(d.timestamp).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="text-emerald-500 text-sm font-bold">✓</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
