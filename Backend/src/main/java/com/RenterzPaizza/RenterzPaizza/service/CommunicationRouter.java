package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationChannel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CommunicationRouter {

    public List<CommunicationChannel> resolveChannels(User user) {

        List<CommunicationChannel> channels = new ArrayList<>();

        if (user.getMobile() != null && !user.getMobile().isBlank()) {

            channels.add(CommunicationChannel.SMS);
            channels.add(CommunicationChannel.WHATSAPP);

            // VOICE mandatory
            channels.add(CommunicationChannel.VOICE);
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            channels.add(CommunicationChannel.EMAIL);
        }

        return channels;
    }
}
