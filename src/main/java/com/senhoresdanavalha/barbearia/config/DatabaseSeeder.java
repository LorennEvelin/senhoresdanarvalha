package com.senhoresdanavalha.barbearia.config;

import com.senhoresdanavalha.barbearia.model.Barbeiro;
import com.senhoresdanavalha.barbearia.model.Servico;
import com.senhoresdanavalha.barbearia.model.TipoUsuario;
import com.senhoresdanavalha.barbearia.model.Usuario;
import com.senhoresdanavalha.barbearia.repository.BarbeiroRepository;
import com.senhoresdanavalha.barbearia.repository.ServicoRepository;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ServicoRepository servicoRepository;
    private final BarbeiroRepository barbeiroRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UsuarioRepository usuarioRepository,
                          ServicoRepository servicoRepository,
                          BarbeiroRepository barbeiroRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.barbeiroRepository = barbeiroRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByEmail("admin@senhoresdanavalha.com.br").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador");
            admin.setEmail("admin@senhoresdanavalha.com.br");
            admin.setTelefone("(11) 99999-0000");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setTipoUsuario(TipoUsuario.ADMIN);
            usuarioRepository.save(admin);
        }

        if (usuarioRepository.findByEmail("cliente.teste@teste.com").isEmpty()) {
            Usuario clienteTeste = new Usuario();
            clienteTeste.setNome("Cliente Teste");
            clienteTeste.setEmail("cliente.teste@teste.com");
            clienteTeste.setTelefone("(11) 98888-7777");
            clienteTeste.setSenha(passwordEncoder.encode("cliente123"));
            clienteTeste.setTipoUsuario(TipoUsuario.CLIENTE);
            usuarioRepository.save(clienteTeste);
        }

        if (servicoRepository.count() == 0) {
            Servico corte = new Servico();
            corte.setNome("Corte Masculino");
            corte.setDescricao("Corte sob medida com acabamento premium.");
            corte.setValor(new BigDecimal("55.00"));
            corte.setDuracao(45);
            servicoRepository.save(corte);

            Servico barba = new Servico();
            barba.setNome("Barba");
            barba.setDescricao("Modelagem, hidratação e definição de contorno.");
            barba.setValor(new BigDecimal("40.00"));
            barba.setDuracao(30);
            servicoRepository.save(barba);

            Servico combo = new Servico();
            combo.setNome("Corte + Barba");
            combo.setDescricao("Combo completo para visual refinado e elegante.");
            combo.setValor(new BigDecimal("85.00"));
            combo.setDuracao(60);
            servicoRepository.save(combo);
        }

        if (barbeiroRepository.count() == 0) {
            Barbeiro rafael = new Barbeiro();
            rafael.setNome("Rafael");
            rafael.setEspecialidade("Corte clássico e barba");
            barbeiroRepository.save(rafael);

            Barbeiro mateus = new Barbeiro();
            mateus.setNome("Mateus");
            mateus.setEspecialidade("Estilo moderno e acabamento premium");
            barbeiroRepository.save(mateus);
        }
    }
}
