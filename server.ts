import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/**
 * 1. Endpoint para Criar Preference de Pagamento (Checkout Pro / Pix / Cartão)
 */
app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { accessToken, items, payer, orderNumber, backUrls, notificationUrl } = req.body;

    const token = accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ error: 'Access Token do Mercado Pago não informado' });
    }

    const client = new MercadoPagoConfig({
      accessToken: token.trim(),
      options: { timeout: 7000 }
    });

    const preference = new Preference(client);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const baseUrl = `${protocol}://${host}`;

    const response = await preference.create({
      body: {
        items: (items || []).map((item: any) => ({
          id: String(item.id || 'item'),
          title: String(item.title || item.name || 'Peça SAGAS Brasil'),
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price || item.price || 0),
          currency_id: 'BRL',
          picture_url: item.picture_url || item.image
        })),
        payer: {
          email: payer?.email || 'cliente@email.com',
          name: payer?.name || 'Cliente SAGAS'
        },
        external_reference: String(orderNumber || `SG-${Date.now()}`),
        back_urls: backUrls || {
          success: `${baseUrl}/?status=approved&order=${orderNumber}`,
          pending: `${baseUrl}/?status=pending&order=${orderNumber}`,
          failure: `${baseUrl}/?status=failure&order=${orderNumber}`
        },
        auto_return: 'approved',
        notification_url: notificationUrl || `${baseUrl}/api/mercadopago/webhook`
      }
    });

    return res.status(200).json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (err: any) {
    console.error('Erro ao criar Preference Mercado Pago:', err);
    return res.status(500).json({
      error: 'Falha ao criar Preference no Mercado Pago',
      message: err.message || String(err)
    });
  }
});

/**
 * 2. Endpoint para Criar Pix Transparente Instantâneo
 */
app.post('/api/mercadopago/create-pix', async (req: Request, res: Response) => {
  try {
    const { accessToken, amount, description, payer, orderNumber, notificationUrl } = req.body;

    const token = accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ error: 'Access Token do Mercado Pago não informado' });
    }

    const client = new MercadoPagoConfig({
      accessToken: token.trim(),
      options: { timeout: 7000 }
    });

    const payment = new Payment(client);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const baseUrl = `${protocol}://${host}`;

    const cleanCpf = (payer?.cpf || '19119119100').replace(/\D/g, '');

    const response = await payment.create({
      body: {
        transaction_amount: Number(Number(amount).toFixed(2)),
        description: description || `Pedido ${orderNumber} - Sagas Brasil Moda`,
        payment_method_id: 'pix',
        external_reference: String(orderNumber),
        payer: {
          email: payer?.email || 'cliente@email.com',
          first_name: payer?.firstName || payer?.name || 'Cliente',
          identification: {
            type: 'CPF',
            number: cleanCpf
          }
        },
        notification_url: notificationUrl || `${baseUrl}/api/mercadopago/webhook`
      }
    });

    const transactionData = response.point_of_interaction?.transaction_data;

    return res.status(200).json({
      paymentId: response.id,
      status: response.status,
      statusDetail: response.status_detail,
      qrCode: transactionData?.qr_code || '',
      qrCodeBase64: transactionData?.qr_code_base64 || '',
      ticketUrl: transactionData?.ticket_url || ''
    });
  } catch (err: any) {
    console.error('Erro ao gerar Pix no Mercado Pago:', err);
    return res.status(500).json({
      error: 'Falha ao gerar Pix no Mercado Pago',
      message: err.message || String(err)
    });
  }
});

/**
 * 3. Endpoint de Webhook (IPN) do Mercado Pago para Baixa Automática
 */
app.post('/api/mercadopago/webhook', async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const body = req.body;

    // O Mercado Pago pode enviar o ID via query (?data.id=123 ou ?id=123) ou via body
    const paymentId = body?.data?.id || query['data.id'] || query.id;
    const topic = query.topic || body?.type || query.type;

    console.log(`[Mercado Pago Webhook] Recebida notificação: topic=${topic}, paymentId=${paymentId}`);

    if (paymentId && (topic === 'payment' || body?.action?.startsWith('payment.'))) {
      const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (token) {
        const client = new MercadoPagoConfig({
          accessToken: token.trim(),
          options: { timeout: 7000 }
        });
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: String(paymentId) });

        console.log(`[Mercado Pago Webhook] Status do pagamento ${paymentId}: ${paymentData.status} (Pedido: ${paymentData.external_reference})`);

        // Aqui você pode atualizar o Firestore:
        // status === 'approved' -> atualiza pedido para 'aprovado'
      }
    }

    // Mercado Pago exige resposta HTTP 200/201 rápida para confirmar recebimento
    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('Erro ao processar Webhook Mercado Pago:', err);
    return res.status(200).send('Webhook recebido'); // Retorna 200 para evitar retentativas infinitas
  }
});

/**
 * 4. Iniciar Vite em Dev ou Servir Estáticos em Produção
 */
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sagas Brasil Moda server running on http://localhost:${PORT}`);
  });
}

startServer();
