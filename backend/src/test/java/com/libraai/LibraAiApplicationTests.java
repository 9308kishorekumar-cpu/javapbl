package com.libraai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("dev")
class LibraAiApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoads() {
        assertNotNull(jdbcTemplate, "JdbcTemplate should be wired");
    }

    @Test
    void testFlywayMigrationsApplied() {
        Integer roleCount = jdbcTemplate.queryForObject("SELECT count(*) FROM roles", Integer.class);
        assertEquals(3, roleCount, "Roles table should have 3 seeded roles");

        Integer userCount = jdbcTemplate.queryForObject("SELECT count(*) FROM users", Integer.class);
        assertEquals(3, userCount, "Users table should have 3 seeded users");

        Integer bookCount = jdbcTemplate.queryForObject("SELECT count(*) FROM books", Integer.class);
        org.junit.jupiter.api.Assertions.assertTrue(bookCount >= 4, "Books table should have seeded books");
    }
}
