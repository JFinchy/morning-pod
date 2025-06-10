import { describe, it, expect } from "vitest";
import {
  getNextjsTemplate,
  getReactTemplate,
  getNodejsTemplate,
  getGenericTemplate,
} from "@/templates";
import type { ProjectDetection } from "@/types";

describe("Project Templates", () => {
  const mockProjectDetection: ProjectDetection = {
    type: "nextjs",
    packageManager: "bun",
    hasTypeScript: true,
    features: {
      hasDatabase: false,
      hasLinting: true,
      hasTesting: true,
      hasStorybook: false,
      hasTailwind: true,
    },
  };

  describe("Next.js Template", () => {
    it("should generate Next.js template with all categories", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      expect(template.categories).toBeDefined();
      expect(template.categories.length).toBeGreaterThan(0);
      expect(template.type).toBe("nextjs");
    });

    it("should include Next.js specific commands", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      const devCategory = template.categories.find((cat) => cat.name === "dev");
      expect(devCategory).toBeDefined();

      const startCommand = devCategory?.commands.find(
        (cmd) => cmd.name === "start"
      );
      expect(startCommand?.command).toContain("turbo");
    });

    it("should include TypeScript commands when TypeScript is detected", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      const qualityCategory = template.categories.find(
        (cat) => cat.name === "quality"
      );
      expect(qualityCategory).toBeDefined();

      const typeCheckCommand = qualityCategory?.commands.find(
        (cmd) => cmd.name === "type-check"
      );
      expect(typeCheckCommand).toBeDefined();
    });

    it("should include testing commands when testing is detected", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      const testCategory = template.categories.find(
        (cat) => cat.name === "test"
      );
      expect(testCategory).toBeDefined();

      const unitCommand = testCategory?.commands.find(
        (cmd) => cmd.name === "unit"
      );
      expect(unitCommand).toBeDefined();
    });

    it("should exclude database commands when database is not detected", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      const dbCategory = template.categories.find((cat) => cat.name === "db");
      expect(dbCategory).toBeUndefined();
    });

    it("should include database commands when database is detected", () => {
      const projectWithDb: ProjectDetection = {
        ...mockProjectDetection,
        features: {
          ...mockProjectDetection.features,
          hasDatabase: true,
        },
      };

      const template = getNextjsTemplate(projectWithDb);

      const dbCategory = template.categories.find((cat) => cat.name === "db");
      expect(dbCategory).toBeDefined();

      const generateCommand = dbCategory?.commands.find(
        (cmd) => cmd.name === "generate"
      );
      expect(generateCommand).toBeDefined();
    });
  });

  describe("React Template", () => {
    const reactProject: ProjectDetection = {
      type: "react",
      packageManager: "npm",
      hasTypeScript: false,
      features: {
        hasDatabase: false,
        hasLinting: true,
        hasTesting: true,
        hasStorybook: false,
        hasTailwind: false,
      },
    };

    it("should generate React template", () => {
      const template = getReactTemplate(reactProject);

      expect(template.categories).toBeDefined();
      expect(template.categories.length).toBeGreaterThan(0);
      expect(template.type).toBe("react");
    });

    it("should include React specific commands", () => {
      const template = getReactTemplate(reactProject);

      const devCategory = template.categories.find((cat) => cat.name === "dev");
      expect(devCategory).toBeDefined();

      const startCommand = devCategory?.commands.find(
        (cmd) => cmd.name === "start"
      );
      expect(startCommand?.command).toContain("start");
    });
  });

  describe("Node.js Template", () => {
    const nodeProject: ProjectDetection = {
      type: "node",
      packageManager: "npm",
      hasTypeScript: true,
      features: {
        hasDatabase: true,
        hasLinting: true,
        hasTesting: true,
        hasStorybook: false,
        hasTailwind: false,
      },
    };

    it("should generate Node.js template", () => {
      const template = getNodejsTemplate(nodeProject);

      expect(template.categories).toBeDefined();
      expect(template.categories.length).toBeGreaterThan(0);
      expect(template.type).toBe("node");
    });

    it("should include Node.js specific commands", () => {
      const template = getNodejsTemplate(nodeProject);

      const devCategory = template.categories.find((cat) => cat.name === "dev");
      expect(devCategory).toBeDefined();

      const startCommand = devCategory?.commands.find(
        (cmd) => cmd.name === "start"
      );
      expect(startCommand).toBeDefined();
    });
  });

  describe("Generic Template", () => {
    const genericProject: ProjectDetection = {
      type: "generic",
      packageManager: "npm",
      hasTypeScript: false,
      features: {
        hasDatabase: false,
        hasLinting: false,
        hasTesting: false,
        hasStorybook: false,
        hasTailwind: false,
      },
    };

    it("should generate generic template", () => {
      const template = getGenericTemplate(genericProject);

      expect(template.categories).toBeDefined();
      expect(template.categories.length).toBeGreaterThan(0);
      expect(template.type).toBe("generic");
    });
  });

  describe("Package Manager Support", () => {
    it("should support different package managers", () => {
      const bunProject = {
        ...mockProjectDetection,
        packageManager: "bun" as const,
      };
      const npmProject = {
        ...mockProjectDetection,
        packageManager: "npm" as const,
      };
      const yarnProject = {
        ...mockProjectDetection,
        packageManager: "yarn" as const,
      };
      const pnpmProject = {
        ...mockProjectDetection,
        packageManager: "pnpm" as const,
      };

      const bunTemplate = getNextjsTemplate(bunProject);
      const npmTemplate = getNextjsTemplate(npmProject);
      const yarnTemplate = getNextjsTemplate(yarnProject);
      const pnpmTemplate = getNextjsTemplate(pnpmProject);

      expect(bunTemplate.packageManager).toBe("bun");
      expect(npmTemplate.packageManager).toBe("npm");
      expect(yarnTemplate.packageManager).toBe("yarn");
      expect(pnpmTemplate.packageManager).toBe("pnpm");
    });
  });

  describe("Template Structure Validation", () => {
    it("should have valid template structure", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      expect(template.name).toBeDefined();
      expect(template.type).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.packageManager).toBeDefined();
      expect(template.categories).toBeDefined();
      expect(Array.isArray(template.categories)).toBe(true);
    });

    it("should have valid category structure", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      template.categories.forEach((category) => {
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(category.commands).toBeDefined();
        expect(Array.isArray(category.commands)).toBe(true);
      });
    });

    it("should have valid command structure", () => {
      const template = getNextjsTemplate(mockProjectDetection);

      template.categories.forEach((category) => {
        category.commands.forEach((command) => {
          expect(command.name).toBeDefined();
          expect(command.command).toBeDefined();
          expect(command.description).toBeDefined();
        });
      });
    });
  });

  describe("Feature Detection Integration", () => {
    it("should adapt to project features", () => {
      const fullFeaturedProject: ProjectDetection = {
        type: "nextjs",
        packageManager: "bun",
        hasTypeScript: true,
        features: {
          hasDatabase: true,
          hasLinting: true,
          hasTesting: true,
          hasStorybook: true,
          hasTailwind: true,
        },
      };

      const template = getNextjsTemplate(fullFeaturedProject);

      // Should include database commands
      const dbCategory = template.categories.find((cat) => cat.name === "db");
      expect(dbCategory).toBeDefined();
    });

    it("should handle minimal project features", () => {
      const minimalProject: ProjectDetection = {
        type: "nextjs",
        packageManager: "npm",
        hasTypeScript: false,
        features: {
          hasDatabase: false,
          hasLinting: false,
          hasTesting: false,
          hasStorybook: false,
          hasTailwind: false,
        },
      };

      const template = getNextjsTemplate(minimalProject);

      // Should still have basic categories
      expect(template.categories.length).toBeGreaterThan(0);

      // Should not include database commands
      const dbCategory = template.categories.find((cat) => cat.name === "db");
      expect(dbCategory).toBeUndefined();
    });
  });
});
