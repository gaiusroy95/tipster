import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSampleFaqData1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert FAQ Categories
        await queryRunner.query(`
            INSERT INTO faq_categories (id, name, description, sortOrder, createdAt, updatedAt) VALUES
            ('cat-1', 'Getting Started', 'Basic information for new users', 1, NOW(), NOW()),
            ('cat-2', 'Account & Security', 'Account management and security questions', 2, NOW(), NOW()),
            ('cat-3', 'Deposits & Withdrawals', 'Payment and withdrawal related questions', 3, NOW(), NOW()),
            ('cat-4', 'Games & Gaming', 'Questions about games and gameplay', 4, NOW(), NOW()),
            ('cat-5', 'Technical Support', 'Technical issues and troubleshooting', 5, NOW(), NOW())
        `);

        // Insert FAQ Items
        await queryRunner.query(`
            INSERT INTO faq_items (id, question, answer, sortOrder, isActive, categoryId, createdAt, updatedAt) VALUES
            ('faq-1', 'How do I create an account?', 'To create an account, click the "Sign Up" button in the top right corner, fill in your email address, username, and password, then verify your email address.', 1, true, 'cat-1', NOW(), NOW()),
            ('faq-2', 'What games are available?', 'We offer a wide variety of sports betting options. You can browse all available games in the Games section.', 2, true, 'cat-1', NOW(), NOW()),
            ('faq-3', 'How do I verify my account?', 'After creating your account, check your email for a verification link. Click the link to verify your account. You may also need to provide additional documents for full verification.', 3, true, 'cat-1', NOW(), NOW()),
            
            ('faq-4', 'How do I change my password?', 'Go to Settings > Account Settings > Change Password. Enter your current password and your new password twice to confirm.', 1, true, 'cat-2', NOW(), NOW()),
            ('faq-5', 'What if I forget my password?', 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.', 2, true, 'cat-2', NOW(), NOW()),
            ('faq-6', 'How do I enable two-factor authentication?', 'Go to Settings > Security > Two-Factor Authentication and follow the setup instructions. We recommend using an authenticator app for better security.', 3, true, 'cat-2', NOW(), NOW()),
            
            ('faq-7', 'What payment methods do you accept?', 'We accept various cryptocurrencies including Bitcoin, Ethereum, USDT, and other major cryptocurrencies. We also support traditional payment methods like credit cards and bank transfers.', 1, true, 'cat-3', NOW(), NOW()),
            ('faq-8', 'How long do withdrawals take?', 'Cryptocurrency withdrawals are usually processed within 24 hours. Traditional payment method withdrawals may take 3-5 business days depending on your bank.', 2, true, 'cat-3', NOW(), NOW()),
            ('faq-9', 'Are there any fees for deposits or withdrawals?', 'Deposits are generally free. Withdrawal fees vary by payment method - cryptocurrency withdrawals have minimal network fees, while traditional methods may have processing fees.', 3, true, 'cat-3', NOW(), NOW()),
            
            ('faq-10', 'How do I place a sports bet?', 'Select a sport and event from our sportsbook, choose your bet type and odds, set your bet amount, and confirm your bet. Each bet has different rules and payout structures - check the bet details for more information.', 1, true, 'cat-4', NOW(), NOW()),
            ('faq-11', 'What types of bets can I place?', 'We offer various bet types including single bets, parlays, and same-game parlays. Each bet type has different odds and payout structures.', 2, true, 'cat-4', NOW(), NOW()),
            ('faq-12', 'How are bet payouts calculated?', 'Bet payouts are calculated based on the odds and bet amount. For single bets, multiply your bet amount by the odds. For parlays, multiply all odds together and then by your bet amount.', 3, true, 'cat-4', NOW(), NOW()),
            
            ('faq-13', 'The game is not loading properly. What should I do?', 'Try refreshing your browser, clearing your cache, or switching to a different browser. If the problem persists, contact our support team with details about the issue.', 1, true, 'cat-5', NOW(), NOW()),
            ('faq-14', 'I\'m experiencing lag or slow performance. How can I fix this?', 'Check your internet connection, close other browser tabs, and ensure your browser is up to date. You can also try switching to a different network or device.', 2, true, 'cat-5', NOW(), NOW()),
            ('faq-15', 'How do I contact support?', 'You can contact our support team through live chat (available 24/7), email, or by creating a support ticket. We also have a comprehensive FAQ section for common questions.', 3, true, 'cat-5', NOW(), NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove FAQ Items
        await queryRunner.query(`DELETE FROM faq_items WHERE id IN ('faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5', 'faq-6', 'faq-7', 'faq-8', 'faq-9', 'faq-10', 'faq-11', 'faq-12', 'faq-13', 'faq-14', 'faq-15')`);
        
        // Remove FAQ Categories
        await queryRunner.query(`DELETE FROM faq_categories WHERE id IN ('cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5')`);
    }
}
