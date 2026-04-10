package com.cherryskincare.controller;

import com.cherryskincare.dto.ContactMessageDTO;
import com.cherryskincare.dto.CreateContactMessageDTO;
import com.cherryskincare.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping("/messages")
    public ResponseEntity<ContactMessageDTO> create(@Valid @RequestBody CreateContactMessageDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactMessageService.create(dto));
    }
}

