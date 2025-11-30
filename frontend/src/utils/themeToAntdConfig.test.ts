/**
 * Tests for themeToAntdConfig utility
 * Verifies theme conversion produces valid Ant Design configuration
 */

import { describe, it, expect } from 'vitest';
import { themeToAntdConfig } from './themeToAntdConfig';
import { lightTheme, darkTheme, halloweenTheme } from '../styles/themes';
import { theme as antdTheme } from 'antd';

describe('themeToAntdConfig', () => {
  describe('Light Theme', () => {
    it('should convert light theme to valid Ant Design config', () => {
      const config = themeToAntdConfig(lightTheme);
      
      expect(config).toBeDefined();
      expect(config.token).toBeDefined();
      expect(config.algorithm).toBe(antdTheme.defaultAlgorithm);
    });

    it('should map light theme colors correctly', () => {
      const config = themeToAntdConfig(lightTheme);
      
      expect(config.token?.colorPrimary).toBe(lightTheme.colors.brand.primary);
      expect(config.token?.colorSuccess).toBe(lightTheme.colors.status.success);
      expect(config.token?.colorWarning).toBe(lightTheme.colors.status.warning);
      expect(config.token?.colorError).toBe(lightTheme.colors.status.error);
      expect(config.token?.colorInfo).toBe(lightTheme.colors.status.info);
      expect(config.token?.colorTextBase).toBe(lightTheme.colors.text.primary);
      expect(config.token?.colorBgBase).toBe(lightTheme.colors.background.primary);
      expect(config.token?.colorBorder).toBe(lightTheme.colors.border);
    });

    it('should map light theme typography correctly', () => {
      const config = themeToAntdConfig(lightTheme);
      
      expect(config.token?.fontFamily).toBe(lightTheme.typography.fontFamily.primary);
      expect(config.token?.fontSize).toBe(16);
      expect(config.token?.lineHeight).toBe(lightTheme.typography.lineHeight.normal);
    });

    it('should include component-specific tokens', () => {
      const config = themeToAntdConfig(lightTheme);
      
      expect(config.components).toBeDefined();
      expect(config.components?.Button).toBeDefined();
      expect(config.components?.Card).toBeDefined();
      expect(config.components?.Modal).toBeDefined();
      expect(config.components?.Input).toBeDefined();
    });
  });

  describe('Dark Theme', () => {
    it('should convert dark theme to valid Ant Design config', () => {
      const config = themeToAntdConfig(darkTheme);
      
      expect(config).toBeDefined();
      expect(config.token).toBeDefined();
      expect(config.algorithm).toBe(antdTheme.darkAlgorithm);
    });

    it('should map dark theme colors correctly', () => {
      const config = themeToAntdConfig(darkTheme);
      
      expect(config.token?.colorPrimary).toBe(darkTheme.colors.brand.primary);
      expect(config.token?.colorSuccess).toBe(darkTheme.colors.status.success);
      expect(config.token?.colorWarning).toBe(darkTheme.colors.status.warning);
      expect(config.token?.colorError).toBe(darkTheme.colors.status.error);
      expect(config.token?.colorInfo).toBe(darkTheme.colors.status.info);
      expect(config.token?.colorTextBase).toBe(darkTheme.colors.text.primary);
      expect(config.token?.colorBgBase).toBe(darkTheme.colors.background.primary);
    });

    it('should use dark algorithm for dark theme', () => {
      const config = themeToAntdConfig(darkTheme);
      
      expect(config.algorithm).toBe(antdTheme.darkAlgorithm);
    });
  });

  describe('Halloween Theme', () => {
    it('should convert halloween theme to valid Ant Design config', () => {
      const config = themeToAntdConfig(halloweenTheme);
      
      expect(config).toBeDefined();
      expect(config.token).toBeDefined();
      expect(config.algorithm).toBe(antdTheme.darkAlgorithm);
    });

    it('should map halloween theme colors correctly', () => {
      const config = themeToAntdConfig(halloweenTheme);
      
      expect(config.token?.colorPrimary).toBe(halloweenTheme.colors.brand.primary);
      expect(config.token?.colorSuccess).toBe(halloweenTheme.colors.status.success);
      expect(config.token?.colorWarning).toBe(halloweenTheme.colors.status.warning);
      expect(config.token?.colorError).toBe(halloweenTheme.colors.status.error);
      expect(config.token?.colorInfo).toBe(halloweenTheme.colors.status.info);
      expect(config.token?.colorTextBase).toBe(halloweenTheme.colors.text.primary);
      expect(config.token?.colorBgBase).toBe(halloweenTheme.colors.background.primary);
    });

    it('should use dark algorithm for halloween theme', () => {
      const config = themeToAntdConfig(halloweenTheme);
      
      expect(config.algorithm).toBe(antdTheme.darkAlgorithm);
    });
  });

  describe('Required Token Properties', () => {
    it('should include all required color tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.token?.colorPrimary).toBeDefined();
        expect(config.token?.colorSuccess).toBeDefined();
        expect(config.token?.colorWarning).toBeDefined();
        expect(config.token?.colorError).toBeDefined();
        expect(config.token?.colorInfo).toBeDefined();
        expect(config.token?.colorTextBase).toBeDefined();
        expect(config.token?.colorBgBase).toBeDefined();
        expect(config.token?.colorBorder).toBeDefined();
      });
    });

    it('should include all required typography tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.token?.fontFamily).toBeDefined();
        expect(config.token?.fontSize).toBeDefined();
        expect(config.token?.lineHeight).toBeDefined();
      });
    });

    it('should include all required spacing tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.token?.borderRadius).toBeDefined();
        expect(config.token?.borderRadiusLG).toBeDefined();
        expect(config.token?.borderRadiusSM).toBeDefined();
        expect(config.token?.padding).toBeDefined();
        expect(config.token?.paddingLG).toBeDefined();
        expect(config.token?.paddingSM).toBeDefined();
        expect(config.token?.paddingXS).toBeDefined();
      });
    });

    it('should include all required control tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.token?.controlHeight).toBeDefined();
        expect(config.token?.controlHeightLG).toBeDefined();
        expect(config.token?.controlHeightSM).toBeDefined();
      });
    });
  });

  describe('Component Tokens', () => {
    it('should include Button component tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.components?.Button).toBeDefined();
        expect(config.components?.Button?.primaryShadow).toBeDefined();
        expect(config.components?.Button?.dangerShadow).toBeDefined();
      });
    });

    it('should include Card component tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.components?.Card).toBeDefined();
        expect(config.components?.Card?.boxShadow).toBeDefined();
      });
    });

    it('should include Modal component tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.components?.Modal).toBeDefined();
        expect(config.components?.Modal?.contentBg).toBe(theme.colors.background.primary);
        expect(config.components?.Modal?.headerBg).toBe(theme.colors.background.secondary);
      });
    });

    it('should include Input component tokens for all themes', () => {
      const themes = [lightTheme, darkTheme, halloweenTheme];
      
      themes.forEach(theme => {
        const config = themeToAntdConfig(theme);
        
        expect(config.components?.Input).toBeDefined();
        expect(config.components?.Input?.activeBg).toBe(theme.colors.background.primary);
        expect(config.components?.Input?.hoverBg).toBe(theme.colors.hover);
      });
    });
  });
});
