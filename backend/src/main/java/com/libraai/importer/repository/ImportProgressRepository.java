package com.libraai.importer.repository;

import com.libraai.importer.entity.ImportProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImportProgressRepository extends JpaRepository<ImportProgress, Long> {

    Optional<ImportProgress> findByLanguageAndSubject(String language, String subject);

    List<ImportProgress> findByStatus(String status);
}
