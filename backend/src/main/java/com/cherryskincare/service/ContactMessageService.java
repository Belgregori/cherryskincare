package com.cherryskincare.service;

import com.cherryskincare.dto.ContactMessageDTO;
import com.cherryskincare.dto.CreateContactMessageDTO;
import com.cherryskincare.exception.ContactMessageNotFoundException;
import com.cherryskincare.model.ContactMessage;
import com.cherryskincare.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageDTO create(CreateContactMessageDTO dto) {
        ContactMessage msg = new ContactMessage();
        msg.setName(dto.getName().trim());
        msg.setEmail(dto.getEmail().trim());
        msg.setMessage(dto.getMessage().trim());
        msg.setRead(false);

        ContactMessage saved = contactMessageRepository.save(msg);
        return toDTO(saved);
    }

    public List<ContactMessageDTO> listAll() {
        return contactMessageRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public ContactMessageDTO markRead(Long id, boolean read) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ContactMessageNotFoundException(id));
        msg.setRead(read);
        return toDTO(contactMessageRepository.save(msg));
    }

    private ContactMessageDTO toDTO(ContactMessage msg) {
        ContactMessageDTO dto = new ContactMessageDTO();
        dto.setId(msg.getId());
        dto.setName(msg.getName());
        dto.setEmail(msg.getEmail());
        dto.setMessage(msg.getMessage());
        dto.setRead(msg.isRead());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }
}

