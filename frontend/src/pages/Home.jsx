import bannerImg from '../assets/banner.js';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Box sx={{ background: '#fff', minHeight: '80vh', py: 6 }}>
      <Grid container justifyContent="center" alignItems="center" spacing={4}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Typography variant="h2" color="primary" gutterBottom sx={{ fontWeight: 900, letterSpacing: 2 }}>
              VTT Pizzaria
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
              Rodízio, À La Carte e Delivery
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 3, maxWidth: 500 }}>
              Fundada em 1525 por Vincenzo Taddei Tramonetti, a VTT Pizzaria carrega mais de 500 anos de tradição italiana em cada fatia. Nascida no calor de um forno a lenha na Toscana, atravessou gerações, continentes e séculos — mantendo viva a arte da pizza artesanal.
Hoje, a VTT não é apenas referência no Brasil, mas um verdadeiro império interplanetário do sabor. Reconhecida em colônias lunares e estações orbitais, a VTT Pizzaria domina o sistema solar quando o assunto é pizza.
Com ingredientes selecionados, massa fermentada naturalmente e um legado inabalável, servimos muito mais que comida: servimos história.
            </Typography>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden', maxWidth: 500, mx: 'auto' }}>
              <img
                src={bannerImg}
                alt="Salão Parma"
                style={{ width: '100%', display: 'block' }}
              />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      <Box mt={6} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          R. Alidolao Pertinho 333, Centro - Palha do osso &nbsp;|&nbsp; (48) 9999-9999 &nbsp;|&nbsp; (48) 99999-9999
        </Typography>
      </Box>
    </Box>
  );
}
