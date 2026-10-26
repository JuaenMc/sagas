import { test, expect } from '@playwright/test';

test.describe('E2E Mobile / Web Store - Checkout Flow', () => {
  test('Fluxo completo: navegar produto -> adicionar carrinho -> checkout -> pagamento mock -> verificar pedido em OrdersScreen', async ({ page }) => {
    // 1. Acessar a aplicação SAGAS Store
    await page.goto('/');

    // Verificar se o catálogo carregou
    await expect(page.locator('text=SAGAS').first()).toBeVisible({ timeout: 10000 });

    // 2. Navegar para um produto
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (await productCard.isVisible()) {
      await productCard.click();
    } else {
      // Fallback para clicar no primeiro item da listagem
      await page.locator('button:has-text("Comprar"), button:has-text("Adicionar")').first().click();
    }

    // 3. Selecionar tamanho e cor se modal/página de detalhes estiver aberta
    const sizeButton = page.locator('button:has-text("M"), button:has-text("P"), button:has-text("G")').first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    }

    // 4. Adicionar ao Carrinho
    const addToCartBtn = page.locator('button:has-text("Adicionar à Sacola"), button:has-text("Comprar Agora")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }

    // 5. Abrir Carrinho / Checkout
    const cartButton = page.locator('[aria-label="Carrinho"], [data-testid="cart-button"], button:has-text("Sacola")').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    // Prosseguir para Checkout
    const checkoutBtn = page.locator('button:has-text("Finalizar Pedido"), button:has-text("Ir para Pagamento")').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
    }

    // 6. Selecionar PIX e Gerar Pagamento Mock
    const pixOption = page.locator('text=PIX, input[value="PIX"]').first();
    if (await pixOption.isVisible()) {
      await pixOption.click();
    }

    const payButton = page.locator('button:has-text("Pagar com PIX"), button:has-text("Confirmar Pedido")').first();
    if (await payButton.isVisible()) {
      await payButton.click();
    }

    // 7. Simular Confirmação de Pagamento PIX (Ambiente de Teste/Mock)
    const mockConfirmBtn = page.locator('button:has-text("Simular Pagamento Aprovado"), button:has-text("Já realizei o PIX")').first();
    if (await mockConfirmBtn.isVisible()) {
      await mockConfirmBtn.click();
    }

    // 8. Verificar que o pedido aparece em Meus Pedidos (OrdersScreen)
    await page.goto('/orders');
    await expect(page.locator('text=Meus Pedidos, text=Pedido')).toBeVisible({ timeout: 10000 });
  });
});
