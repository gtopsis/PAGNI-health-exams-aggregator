import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MedicalReportsCardHeader from "./MedicalReportsCardHeader.vue";

describe("MedicalReportsCardHeader", () => {
  it("emits toggle-upload when the toggle button is clicked", async () => {
    const wrapper = mount(MedicalReportsCardHeader, {
      props: { isEmpty: false },
    });
    await wrapper.find('[data-testid="toggle-upload"]').trigger("click");
    expect(wrapper.emitted("toggle-upload")).toHaveLength(1);
  });

  it("asks for confirmation before clearing all reports", async () => {
    const wrapper = mount(MedicalReportsCardHeader, {
      props: { isEmpty: false },
    });

    await wrapper.find('[data-testid="clear-all"]').trigger("click");
    // not emitted yet — confirmation required
    expect(wrapper.emitted("clear-all")).toBeUndefined();
    expect(wrapper.find('[data-testid="confirm-clear"]').exists()).toBe(true);

    await wrapper.find('[data-testid="confirm-clear"]').trigger("click");
    expect(wrapper.emitted("clear-all")).toHaveLength(1);
  });

  it("can cancel the clear-all confirmation", async () => {
    const wrapper = mount(MedicalReportsCardHeader, {
      props: { isEmpty: false },
    });

    await wrapper.find('[data-testid="clear-all"]').trigger("click");
    await wrapper.find('[data-testid="cancel-clear"]').trigger("click");

    expect(wrapper.find('[data-testid="confirm-clear"]').exists()).toBe(false);
    expect(wrapper.emitted("clear-all")).toBeUndefined();
  });

  it("hides the clear-all button when there are no reports", () => {
    const wrapper = mount(MedicalReportsCardHeader, {
      props: { isEmpty: true },
    });
    expect(wrapper.find('[data-testid="clear-all"]').exists()).toBe(false);
  });
});
