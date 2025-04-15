import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorageState } from '@/hooks/use-local-storage'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'

const DiaryEntry = ({
  date,
  note,
  onEdit,
  onDelete,
}: {
  date: string
  note?: string
  onEdit: () => void
  onDelete: () => void
}) => (
  <div className="p-6 bg-white rounded-xl shadow-lg mb-4 hover:shadow-xl transition-shadow duration-300 border border-gray-100 break-words relative group">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-50 rounded-full text-blue-500"
      aria-label="Редактировать"
    >
      ✎
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full text-red-500"
      aria-label="Удалить"
    >
      ✕
    </button>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-semibold text-indigo-700">
        {format(new Date(date), "dd MMMM yyyy", { locale: ru })}
      </h3>
      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
    </div>
    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[300px]">
      {note || 'Нет заметок на этот день'}
    </p>
  </div>
)

export default function HomePage() {
  const navigate = useNavigate()
  const [currentUser] = useLocalStorageState<{ email: string } | null>('currentUser', null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [allNotes, setAllNotes] = useLocalStorageState<Record<string, Record<string, string>>>('userNotes', {})
  const [newNote, setNewNote] = useState('')
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [editDate, setEditDate] = useState<string | null>(null)
const [editNote, setEditNote] = useState('')
const [showEditModal, setShowEditModal] = useState(false)
const [dateToDelete, setDateToDelete] = useState<string | null>(null)
const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false)
const [editPendingNote, setEditPendingNote] = useState<{ date: string, note: string } | null>(null)
const [showAboutModal, setShowAboutModal] = useState(false)

  const userNotes = currentUser ? (allNotes[currentUser.email] || {}) : {}

  const handleLogout = () => {
    navigate('/login')
  }

  const handleShowAbout = () => {
    setShowAboutModal(true)
  }

  const handleCloseAbout = () => {
    setShowAboutModal(false)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date), { locale: ru, weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(date), { locale: ru, weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const formatMonthYear = (date: Date) => {
    const monthIndex = date.getMonth() as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
    const month = ru.localize?.month(monthIndex, { width: 'wide' })
    const year = format(date, 'yyyy')
    return `${month} ${year}`
  }

  const currentMonthDays = getDaysInMonth(currentMonth)

  const handleDateClick = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    setSelectedDate(formattedDate)
    setShowAddNoteModal(true)
  }

  const saveNote = () => {
    setShowConfirmationModal(true)
  }

  const confirmSaveNote = () => {
    if (!newNote.trim() || !currentUser) return

    const updatedUserNotes = {
      ...userNotes,
      [selectedDate]: newNote.trim()
    }

    setAllNotes(prev => {
      const newNotes = {
        ...prev,
        [currentUser.email]: updatedUserNotes
      }
      window.localStorage.setItem('userNotes', JSON.stringify(newNotes))
      return newNotes
    })

    setNewNote('')
    setShowAddNoteModal(false)
    setShowConfirmationModal(false)
  }

  const deleteNote = (date: string) => {
    if (!currentUser) return;

    const updatedUserNotes = { ...userNotes };
    delete updatedUserNotes[date];

    setAllNotes(prev => {
      const newNotes = {
        ...prev,
        [currentUser.email]: updatedUserNotes
      };
      window.localStorage.setItem('userNotes', JSON.stringify(newNotes));
      return newNotes;
    });
  };

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const handleEdit = (date: string) => {
    setEditDate(date); 
    setEditNote(userNotes[date] || ''); 
    setShowEditModal(true); 
    setEditPendingNote({ date, note: userNotes[date] || '' });
  }
  
  const saveEditedNote = () => {
    if (!editDate) return
    setEditPendingNote({ date: editDate, note: editNote })
    setShowEditModal(false)
    setShowEditConfirmationModal(true)
  }

  const confirmEditNote = () => {
    if (!editPendingNote || !currentUser) return
  
    const { date, note } = editPendingNote
  
    const updatedUserNotes = {
      ...userNotes,
      [date]: note.trim()
    }
  
    setAllNotes(prev => {
      const newNotes = {
        ...prev,
        [currentUser.email]: updatedUserNotes
      }
      window.localStorage.setItem('userNotes', JSON.stringify(newNotes))
      return newNotes
    })
  
    setEditPendingNote(null)
    setShowEditConfirmationModal(false)
  }

  const confirmDelete = () => {
    if (!currentUser || !dateToDelete) return
  
    const updatedUserNotes = { ...userNotes }
    delete updatedUserNotes[dateToDelete]
  
    setAllNotes(prev => {
      const newNotes = {
        ...prev,
        [currentUser.email]: updatedUserNotes,
      }
      window.localStorage.setItem('userNotes', JSON.stringify(newNotes))
      return newNotes
    })
  
    setDateToDelete(null)
    setEditPendingNote(null) 
    setShowEditConfirmationModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <nav className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-indigo-900">✨ Мой Дневник</h1>
          </div>
          <div className="flex items-center space-x-4">
          <span className="text-gray-600">{currentUser?.email}</span>
          <button onClick={handleShowAbout} className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none">О приложении</button>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none">Выйти</button>
          </div>
        </div>
      </div>
    </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-indigo-900">{formatMonthYear(currentMonth)}</h2>
          <div className="flex space-x-2">
            <button onClick={handlePreviousMonth} className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors">←</button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors text-sm">Сегодня</button>
            <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors">→</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="text-center font-medium py-2 text-indigo-600">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {currentMonthDays.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const hasNote = userNotes[dateStr]
              const isCurrentMonth = isSameMonth(date, currentMonth)
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    p-3 text-center rounded-lg cursor-pointer transition-all duration-200
                    ${hasNote ? 'bg-indigo-100 hover:bg-indigo-200' : 'hover:bg-gray-100'}
                    ${isWeekend(date) ? 'text-red-500' : 'text-gray-700'}
                    ${dateStr === selectedDate ? 'ring-2 ring-indigo-500' : ''}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  {format(date, 'd')}
                  {hasNote && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {showAddNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
              <h2 className="text-2xl font-bold mb-6 text-indigo-900">
                ✍️ Заметка для {format(new Date(selectedDate), "dd MMMM yyyy", { locale: ru })}
              </h2>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none flex-grow"
                placeholder="Запишите свои мысли здесь..."
                style={{ minHeight: '150px', maxHeight: '50vh' }}
              />
              <div className="flex justify-end gap-3 mt-auto">
                <button onClick={() => setShowAddNoteModal(false)} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Отмена</button>
                <button onClick={saveNote} className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg shadow-indigo-200">Сохранить заметку</button>
              </div>
            </div>
          </div>
        )}

{showAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">✨ О приложении</h2>
            <p className="text-gray-600 mb-6">
              Это приложение представляет собой дневник, который позволяет пользователю записывать свои мысли на каждый день. Вы можете организовывать свои планы и мысли с помощью календаря и заметок. Приятного использования!
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCloseAbout} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Закрыть</button>
            </div>
          </div>
        </div>
      )}

        {showConfirmationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-indigo-900">Подтвердите сохранение заметки</h2>
              <p className="text-gray-600 mb-6">Вы уверены, что хотите сохранить эту заметку?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowConfirmationModal(false)} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Отменить</button>
                <button onClick={confirmSaveNote} className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg shadow-indigo-200">Подтвердить</button>
              </div>
            </div>
          </div>
        )}
        {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">
        ✏️ Редактировать заметку от {format(new Date(editDate!), "dd MMMM yyyy", { locale: ru })}
      </h2>
      <textarea
        value={editNote}
        onChange={(e) => setEditNote(e.target.value)}
        className="w-full p-4 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none flex-grow"
        placeholder="Измените заметку..."
        style={{ minHeight: '150px', maxHeight: '50vh' }}
      />
      <div className="flex justify-end gap-3 mt-auto">
        <button onClick={() => setShowEditModal(false)} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Отмена</button>
        <button onClick={saveEditedNote} className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg shadow-indigo-200">Сохранить</button>
      </div>
    </div>
  </div>
)}

{dateToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">Удалить заметку?</h2>
      <p className="text-gray-600 mb-6">
        Вы уверены, что хотите удалить заметку от {format(new Date(dateToDelete), "dd MMMM yyyy", { locale: ru })}?
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={() => setDateToDelete(null)} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Отмена</button>
        <button onClick={confirmDelete} className="px-4 md:px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium shadow-lg shadow-red-200">Удалить</button>
      </div>
    </div>
  </div>
)}
{showEditConfirmationModal && editPendingNote && (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-[32rem] shadow-2xl transform transition-all">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">Подтвердите изменения</h2>
      <p className="text-gray-600 mb-6">
        Вы уверены, что хотите сохранить изменения для заметки от {format(new Date(editPendingNote.date), "dd MMMM yyyy", { locale: ru })}?
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={() => {
          setShowEditConfirmationModal(false)
          setShowEditModal(true)
        }} className="px-4 md:px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium">Отмена</button>
        <button onClick={confirmEditNote} className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg shadow-indigo-200">Подтвердить</button>
      </div>
    </div>
  </div>
)}

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">📝 Мои заметки</h2>
          {Object.entries(userNotes).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Пока нет заметок. Нажмите на день в календаре, чтобы начать! ✨
            </div>
          ) : (
            Object.entries(userNotes)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, note]) => (
                <DiaryEntry
                key={date}
                date={date}
                note={note}
                onEdit={() => handleEdit(date)}
                onDelete={() => setDateToDelete(date)}
              />
              ))
          )}
        </div>
      </div>
    </div>
  )
}
