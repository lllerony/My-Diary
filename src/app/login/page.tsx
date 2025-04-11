import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorageState } from '@/hooks/use-local-storage'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [users] = useLocalStorageState('users', [])
  const [, setCurrentUser] = useLocalStorageState('currentUser')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!email || !password) {
        throw new Error('Пожалуйста, заполните все поля')
      }

      // Симуляция API-запроса
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Проверка, существует ли пользователь и совпадает ли пароль
      const user = users.find((u: any) => u.email === email)
      if (!user || user.password !== password) {
        throw new Error('Неправильный email или пароль')
      }

      // Успешный вход
      setCurrentUser({ email })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-900">✨ Добро пожаловать</h2>
            <p className="text-gray-600 mt-2">Войдите, чтобы получить доступ к своему дневнику</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Почта
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Нет аккаунта?{' '}
            <a 
              href="/register" 
              className="text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={(e) => {
                e.preventDefault()
                navigate('/register')
              }}
            >
              Создать аккаунт
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
