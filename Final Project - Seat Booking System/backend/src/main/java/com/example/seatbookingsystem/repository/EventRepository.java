package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByType(String type);
    List<Event> findByStatus(String status);
    List<Event> findByGenre(String genre);
    List<Event> findByLanguage(String language);
    List<Event> findByOrganiser_UserId(Long organiserId);
    List<Event> findByNameContainingIgnoreCase(String name);

    // ── LIKE-based filtering handles comma-separated values ──────────────────
    // e.g. genre "Action,Thriller" matches filter "Thriller" via LIKE '%Thriller%'
    // e.g. language "Tamil,Hindi" matches filter "Hindi" via LIKE '%Hindi%'
    @Query("SELECT e FROM Event e WHERE " +
            "(:type     IS NULL OR e.type   = :type) AND " +
            "(:genre    IS NULL OR LOWER(e.genre)    LIKE LOWER(CONCAT('%', :genre,    '%'))) AND " +
            "(:language IS NULL OR LOWER(e.language) LIKE LOWER(CONCAT('%', :language, '%'))) AND " +
            "(:status   IS NULL OR e.status = :status) AND " +
            "(:name     IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Event> filterEvents(@Param("type")     String type,
                             @Param("genre")    String genre,
                             @Param("language") String language,
                             @Param("status")   String status,
                             @Param("name")     String name);
}