import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// English at the root, Vietnamese under /vi/, same slugs (docs/features/public-site/design.md#site-language).
export default defineConfig({
  integrations: [
    starlight({
      title: 'OpenViCloud',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        vi: { label: 'Tiếng Việt', lang: 'vi' },
      },
      customCss: [
        '@fontsource/be-vietnam-pro/400.css',
        '@fontsource/be-vietnam-pro/600.css',
        '@fontsource/be-vietnam-pro/700.css',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      components: { Head: './src/components/Head.astro' },
      head: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }],
      sidebar: [
        { label: 'Overview', translations: { vi: 'Tổng quan' }, slug: 'docs' },
        { label: 'Known limitations', translations: { vi: 'Giới hạn hiện tại' }, slug: 'docs/known-limitations' },
        {
          label: 'Guides',
          translations: { vi: 'Hướng dẫn' },
          items: [
            { label: 'Sign up', translations: { vi: 'Đăng ký' }, slug: 'docs/guides/sign-up' },
            { label: 'Network', slug: 'docs/guides/network' },
            { label: 'VM', slug: 'docs/guides/vm' },
            { label: 'Volume', slug: 'docs/guides/volume' },
            { label: 'SSH keys', translations: { vi: 'SSH key' }, slug: 'docs/guides/ssh-keys' },
            { label: 'API tokens', translations: { vi: 'Token API' }, slug: 'docs/guides/api-tokens' },
            { label: 'Public IPv6', translations: { vi: 'IPv6 công khai' }, slug: 'docs/guides/public-ipv6' },
            { label: 'Load balancer', slug: 'docs/guides/load-balancer' },
            { label: 'Firewall', translations: { vi: 'Firewall rule' }, slug: 'docs/guides/firewall' },
            { label: 'Billing', translations: { vi: 'Hoá đơn' }, slug: 'docs/guides/billing' },
            { label: 'Your account', translations: { vi: 'Tài khoản' }, slug: 'docs/guides/account' },
            { label: 'Command-line tool', translations: { vi: 'Dòng lệnh' }, slug: 'docs/guides/cli' },
          ],
        },
        {
          label: 'Concepts',
          translations: { vi: 'Khái niệm' },
          items: [
            { label: 'Zone', slug: 'docs/concepts/zone' },
            { label: 'Sizes', translations: { vi: 'Cấu hình' }, slug: 'docs/concepts/sizes' },
            { label: 'Account limits', translations: { vi: 'Giới hạn tài khoản' }, slug: 'docs/concepts/quotas' },
            { label: 'VM states', translations: { vi: 'Trạng thái VM' }, slug: 'docs/concepts/vm-states' },
            { label: 'Error codes', translations: { vi: 'Mã lỗi' }, slug: 'docs/concepts/error-codes' },
          ],
        },
      ],
    }),
  ],
});
