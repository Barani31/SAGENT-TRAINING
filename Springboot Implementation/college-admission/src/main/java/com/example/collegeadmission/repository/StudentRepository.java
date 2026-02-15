package com.example.collegeadmission.repository;

import com.example.collegeadmission.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {

}