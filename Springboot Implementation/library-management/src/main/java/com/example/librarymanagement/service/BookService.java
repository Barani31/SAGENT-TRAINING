package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Book;
import com.example.librarymanagement.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public String deleteBook(int id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return "Book deleted successfully!";
        } else {
            return "Not found!";
        }
    }

    public Book updateBook(int id, Book updatedBook) {

    if (!bookRepository.existsById(id)) {
        return null;
    }

    updatedBook.setBookId(id);   // because your field is bookId
    return bookRepository.save(updatedBook);
}
}