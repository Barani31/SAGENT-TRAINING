package com.example.librarymanagement.repository;

import com.example.librarymanagement.entity.BookGenre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookGenreRepository extends JpaRepository<BookGenre, Integer> {
}
