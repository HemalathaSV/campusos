/**
 * Campus OS - Digital Campus Library & Book Circulation Data Store
 */

export interface BookItem {
  id: string;
  isbn: string;
  title: string;
  author: string;
  branch: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  publisher: string;
  year: number;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  studentId: string;
  studentName: string;
  usn: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "Borrowed" | "Returned" | "Overdue";
  fineAmount: number;
}

export const initialBooks: BookItem[] = [
  {
    id: "book-1",
    isbn: "978-0131103627",
    title: "The C Programming Language (2nd Edition)",
    author: "Brian W. Kernighan, Dennis M. Ritchie",
    branch: "Computer Science",
    totalCopies: 10,
    availableCopies: 6,
    shelfLocation: "Rack CS-01, Bay A",
    publisher: "Prentice Hall",
    year: 1988,
  },
  {
    id: "book-2",
    isbn: "978-0262033848",
    title: "Introduction to Algorithms (CLRS 3rd Ed)",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    branch: "Computer Science",
    totalCopies: 15,
    availableCopies: 4,
    shelfLocation: "Rack CS-03, Bay C",
    publisher: "MIT Press",
    year: 2009,
  },
  {
    id: "book-3",
    isbn: "978-0134685991",
    title: "Effective Java (3rd Edition)",
    author: "Joshua Bloch",
    branch: "Computer Science",
    totalCopies: 8,
    availableCopies: 3,
    shelfLocation: "Rack CS-04, Bay B",
    publisher: "Addison-Wesley",
    year: 2018,
  },
  {
    id: "book-4",
    isbn: "978-0073398204",
    title: "Engineering Thermodynamics (8th Ed)",
    author: "Michael A. Boles, Yunus A. Cengel",
    branch: "Mechanical",
    totalCopies: 12,
    availableCopies: 7,
    shelfLocation: "Rack ME-02, Bay D",
    publisher: "McGraw-Hill",
    year: 2014,
  },
  {
    id: "book-5",
    isbn: "978-0133942484",
    title: "Microelectronic Circuits (7th Edition)",
    author: "Adel S. Sedra, Kenneth C. Smith",
    branch: "Electronics",
    totalCopies: 14,
    availableCopies: 5,
    shelfLocation: "Rack EC-01, Bay A",
    publisher: "Oxford University Press",
    year: 2015,
  },
  {
    id: "book-6",
    isbn: "978-0470555477",
    title: "Structural Analysis (4th Edition)",
    author: "Aslam Kassimali",
    branch: "Civil",
    totalCopies: 9,
    availableCopies: 5,
    shelfLocation: "Rack CE-02, Bay B",
    publisher: "Cengage Learning",
    year: 2011,
  },
  {
    id: "book-7",
    isbn: "978-0132143011",
    title: "Computer Networks (5th Edition)",
    author: "Andrew S. Tanenbaum, David J. Wetherall",
    branch: "Computer Science",
    totalCopies: 10,
    availableCopies: 2,
    shelfLocation: "Rack CS-02, Bay B",
    publisher: "Pearson",
    year: 2010,
  },
  {
    id: "book-8",
    isbn: "978-0131873254",
    title: "Database System Concepts (6th Edition)",
    author: "Abraham Silberschatz, Henry F. Korth",
    branch: "Computer Science",
    totalCopies: 12,
    availableCopies: 8,
    shelfLocation: "Rack CS-05, Bay A",
    publisher: "McGraw-Hill",
    year: 2010,
  },
];

const STORAGE_KEY_BOOKS = "campusos_library_books";
const STORAGE_KEY_BORROWED = "campusos_library_borrowed";

export function getLibraryCatalog(): BookItem[] {
  const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(initialBooks));
    return initialBooks;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialBooks;
  }
}

export function saveNewBook(book: Omit<BookItem, "id" | "availableCopies">): BookItem {
  const list = getLibraryCatalog();
  const created: BookItem = {
    ...book,
    id: `book-${Date.now()}`,
    availableCopies: book.totalCopies,
  };
  list.unshift(created);
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(list));
  return created;
}

export function getBorrowedRecords(studentId?: string): BorrowedBook[] {
  const stored = localStorage.getItem(STORAGE_KEY_BORROWED);
  let list: BorrowedBook[] = [];
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch {}
  } else {
    // Seed an initial borrow record
    list = [
      {
        id: "borrow-1",
        bookId: "book-2",
        bookTitle: "Introduction to Algorithms (CLRS 3rd Ed)",
        isbn: "978-0262033848",
        studentId: "student-1",
        studentName: "Aarav Sharma",
        usn: "1MS21CS001",
        borrowDate: "2026-11-05",
        dueDate: "2026-11-19",
        status: "Borrowed",
        fineAmount: 0,
      },
    ];
    localStorage.setItem(STORAGE_KEY_BORROWED, JSON.stringify(list));
  }

  // Update overdue status and fine calculation (₹5/day overdue)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  list = list.map(b => {
    if (b.status === "Borrowed") {
      const due = new Date(b.dueDate);
      if (today > due) {
        const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...b,
          status: "Overdue",
          fineAmount: diffDays * 5,
        };
      }
    }
    return b;
  });

  if (!studentId) return list;
  return list.filter(b => b.studentId === studentId);
}

export function borrowBookItem(
  bookId: string,
  student: { id: string; name: string; usn: string }
): { success: boolean; message: string; record?: BorrowedBook } {
  const books = getLibraryCatalog();
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) return { success: false, message: "Book not found." };

  const targetBook = books[bookIndex];
  if (targetBook.availableCopies <= 0) {
    return { success: false, message: "All copies currently checked out by students." };
  }

  const existingBorrows = getBorrowedRecords(student.id);
  const alreadyHas = existingBorrows.some(b => b.bookId === bookId && b.status !== "Returned");
  if (alreadyHas) {
    return { success: false, message: "You already have an active borrowed copy of this book." };
  }

  // Decrease available copies
  targetBook.availableCopies -= 1;
  books[bookIndex] = targetBook;
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));

  // Compute 14-day due date
  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(now.getDate() + 14);

  const newRecord: BorrowedBook = {
    id: `borrow-${Date.now()}`,
    bookId: targetBook.id,
    bookTitle: targetBook.title,
    isbn: targetBook.isbn,
    studentId: student.id,
    studentName: student.name,
    usn: student.usn,
    borrowDate: now.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    status: "Borrowed",
    fineAmount: 0,
  };

  const allBorrows = getBorrowedRecords();
  allBorrows.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY_BORROWED, JSON.stringify(allBorrows));

  return {
    success: true,
    message: `Book "${targetBook.title}" issued! Return by ${newRecord.dueDate}.`,
    record: newRecord,
  };
}

export function returnBookItem(borrowId: string): { success: boolean; message: string } {
  const allBorrows = getBorrowedRecords();
  const recordIndex = allBorrows.findIndex(b => b.id === borrowId);
  if (recordIndex === -1) return { success: false, message: "Record not found." };

  const record = allBorrows[recordIndex];
  record.status = "Returned";
  record.returnDate = new Date().toISOString().split("T")[0];
  allBorrows[recordIndex] = record;
  localStorage.setItem(STORAGE_KEY_BORROWED, JSON.stringify(allBorrows));

  // Increase available copy
  const books = getLibraryCatalog();
  const bookIndex = books.findIndex(b => b.id === record.bookId);
  if (bookIndex !== -1) {
    books[bookIndex].availableCopies = Math.min(books[bookIndex].totalCopies, books[bookIndex].availableCopies + 1);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  }

  return { success: true, message: `Book "${record.bookTitle}" returned successfully.` };
}
