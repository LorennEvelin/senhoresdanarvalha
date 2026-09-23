package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.TipoUsuario;
import com.senhoresdanavalha.barbearia.model.Usuario;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import com.senhoresdanavalha.barbearia.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            response.put("success", false);
            response.put("message", "E-mail já cadastrado.");
            return ResponseEntity.badRequest().body(response);
        }

        usuario.setId(null);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setTipoUsuario(TipoUsuario.CLIENTE);
        usuarioRepository.save(usuario);

        response.put("success", true);
        response.put("message", "Cadastro realizado com sucesso.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload,
                                                     HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        String email = payload.get("email");
        String senha = payload.get("senha");

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, senha)
            );
        } catch (AuthenticationException e) {
            response.put("success", false);
            response.put("message", "E-mail ou senha inválidos.");
            return ResponseEntity.status(401).body(response);
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        request.getSession(true).setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            SecurityContextHolder.getContext()
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        response.put("success", true);
        response.put("token", token);
        response.put("nome", usuario.getNome());
        response.put("tipoUsuario", usuario.getTipoUsuario().name());
        response.put("userId", usuario.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");

        if (email == null || email.isBlank()) {
            response.put("success", false);
            response.put("message", "Informe o e-mail para recuperar a senha.");
            return ResponseEntity.badRequest().body(response);
        }

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            response.put("success", false);
            response.put("message", "E-mail não encontrado.");
            return ResponseEntity.badRequest().body(response);
        }

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuario.setResetTokenExpiraEm(LocalDateTime.now().plusHours(1));
        usuarioRepository.save(usuario);

        response.put("success", true);
        response.put("message", "Token gerado com sucesso. Use-o na tela de redefinição.");
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String token = payload.get("token");
        String novaSenha = payload.get("novaSenha");

        if (token == null || token.isBlank() || novaSenha == null || novaSenha.length() < 6) {
            response.put("success", false);
            response.put("message", "Token e nova senha são obrigatórios e a senha deve ter pelo menos 6 caracteres.");
            return ResponseEntity.badRequest().body(response);
        }

        Usuario usuario = usuarioRepository.findByResetToken(token).orElse(null);
        if (usuario == null) {
            response.put("success", false);
            response.put("message", "Token inválido ou expirado.");
            return ResponseEntity.badRequest().body(response);
        }

        if (usuario.getResetTokenExpiraEm() == null || usuario.getResetTokenExpiraEm().isBefore(LocalDateTime.now())) {
            response.put("success", false);
            response.put("message", "Token expirado. Solicite uma nova recuperação.");
            return ResponseEntity.badRequest().body(response);
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiraEm(null);
        usuarioRepository.save(usuario);

        response.put("success", true);
        response.put("message", "Senha redefinida com sucesso.");
        return ResponseEntity.ok(response);
    }
}
