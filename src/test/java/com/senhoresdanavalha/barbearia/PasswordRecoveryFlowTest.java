package com.senhoresdanavalha.barbearia;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.senhoresdanavalha.barbearia.model.TipoUsuario;
import com.senhoresdanavalha.barbearia.model.Usuario;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PasswordRecoveryFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldGenerateResetTokenAndChangePassword() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setNome("Cliente Teste");
        usuario.setEmail("cliente.recuperacao@test.com");
        usuario.setTelefone("(11) 98888-7777");
        usuario.setSenha(passwordEncoder.encode("senhaAntiga123"));
        usuario.setTipoUsuario(TipoUsuario.CLIENTE);
        usuarioRepository.save(usuario);

        String forgotPayload = objectMapper.writeValueAsString(Map.of("email", "cliente.recuperacao@test.com"));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        Usuario usuarioAtualizado = usuarioRepository.findByEmail("cliente.recuperacao@test.com").orElseThrow();
        assertThat(usuarioAtualizado.getResetToken()).isNotBlank();

        String resetPayload = objectMapper.writeValueAsString(Map.of(
            "token", usuarioAtualizado.getResetToken(),
            "novaSenha", "novaSenha456"
        ));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(resetPayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        Usuario usuarioComSenhaNova = usuarioRepository.findByEmail("cliente.recuperacao@test.com").orElseThrow();
        assertThat(passwordEncoder.matches("novaSenha456", usuarioComSenhaNova.getSenha())).isTrue();
        assertThat(usuarioComSenhaNova.getResetToken()).isNull();
    }
}
