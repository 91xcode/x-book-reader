import { create } from 'zustand'
import { Book } from '@/types/book'

interface LibraryStore {
  books: Book[]
  isLoading: boolean
  currentBookshelf: string
  
  // Actions
  setBooks: (books: Book[]) => void
  addBook: (book: Book) => void
  updateBook: (book: Book) => void
  removeBook: (bookHash: string) => void
  setCurrentBookshelf: (bookshelf: string) => void
  setLoading: (loading: boolean) => void
  setLibrary: (books: Book[]) => void
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  books: [],
  isLoading: false,
  currentBookshelf: 'all',

  setBooks: (books) => set({ books }),

  addBook: (book) => set((state) => ({ 
    books: [...state.books, book] 
  })),

  updateBook: (updatedBook) => set((state) => ({
    books: state.books.map(book => 
      book.hash === updatedBook.hash ? updatedBook : book
    )
  })),

  removeBook: (bookHash) => set((state) => ({
    books: state.books.filter(book => book.hash !== bookHash)
  })),

  setCurrentBookshelf: (bookshelf) => set({ currentBookshelf: bookshelf }),

  setLoading: (loading) => set({ isLoading: loading }),

  setLibrary: (books) => set({ books }),
})) 