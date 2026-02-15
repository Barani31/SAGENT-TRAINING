package com.example.collegeadmission.repository;

import com.example.collegeadmission.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {

}
