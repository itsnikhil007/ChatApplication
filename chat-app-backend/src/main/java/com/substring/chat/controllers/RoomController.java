package com.substring.chat.controllers;


//import com.substring.chat.config.AppConstant;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.RoomRequest;
import com.substring.chat.repositories.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
 
@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "${frontend.url}")
public class RoomController {

    private RoomRepository roomRepository;
    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomRequest request) {

        String roomId = request.getRoomId();
        String userName = request.getUserName();

        if(roomRepository.findByRoomId(roomId) != null){
            return ResponseEntity.badRequest().body("Room already exists!");
        }

        Room room = new Room();
        room.setRoomId(roomId);
        room.getActiveUsers().add(userName.toLowerCase());

        roomRepository.save(room);

        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoomDetails(@PathVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(room);
    }

    //get messages of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessagesByRoom(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ){

        Room room = roomRepository.findByRoomId(roomId);
        if(room == null){
            return ResponseEntity.notFound().build();
        }
        List<Message> messages = room.getMessages();

        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);
        List<Message> paginatedMessages = messages.subList(start, end);

        return  ResponseEntity.ok(paginatedMessages);
    }

    @PostMapping("/{roomId}/users/{userName}/join")
    public ResponseEntity<?> userJoin(
            @PathVariable String roomId,
            @PathVariable String userName
    ) {
        Room room = roomRepository.findByRoomId(roomId);

        if (room == null) {
            return ResponseEntity.status(404).body("ROOM_NOT_FOUND");
        }

        String normalized = userName.trim().toLowerCase();

        if (room.getActiveUsers().contains(normalized)) {
            return ResponseEntity.status(409).body("USERNAME_TAKEN");
        }

        room.getActiveUsers().add(normalized);
        roomRepository.save(room);

        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/{roomId}/users/{userName}/leave")
    public ResponseEntity<?> userLeave(
            @PathVariable String roomId,
            @PathVariable String userName
    ) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) return ResponseEntity.badRequest().body("Room not found");

        room.getActiveUsers().remove(userName.toLowerCase());
        roomRepository.save(room);
        return ResponseEntity.ok("Left successfully");
    }

    @GetMapping("/{roomId}/activeUsers")
    public ResponseEntity<?>  getActiveUser(
            @PathVariable String roomId
    ) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) return ResponseEntity.badRequest().body("Room not found");

        return ResponseEntity.ok(room.getActiveUsers());
    }

    
}
