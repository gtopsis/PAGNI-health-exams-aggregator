import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

import { open } from "@tauri-apps/plugin-dialog";
import FilesUploadArea from "./FilesUploadArea.vue";

const openMock = vi.mocked(open);

beforeEach(() => {
  openMock.mockReset();
});

describe("FilesUploadArea", () => {
  it("emits selected paths from the native dialog", async () => {
    openMock.mockResolvedValueOnce(["/tmp/a.pdf", "/tmp/b.pdf"]);
    const wrapper = mount(FilesUploadArea, { props: { maxSizeMb: 5 } });

    await wrapper.find('[data-testid="pick-files"]').trigger("click");
    await vi.waitFor(() => expect(wrapper.emitted("filesSelected")).toBeTruthy());

    expect(wrapper.emitted("filesSelected")).toEqual([
      [["/tmp/a.pdf", "/tmp/b.pdf"]],
    ]);
  });

  it("handles a single string result from the dialog", async () => {
    openMock.mockResolvedValueOnce("/tmp/one.pdf" as unknown as string[]);
    const wrapper = mount(FilesUploadArea, { props: { maxSizeMb: 5 } });

    await wrapper.find('[data-testid="pick-files"]').trigger("click");
    await vi.waitFor(() => expect(wrapper.emitted("filesSelected")).toBeTruthy());

    expect(wrapper.emitted("filesSelected")).toEqual([[["/tmp/one.pdf"]]]);
  });

  it("does nothing when the dialog is cancelled", async () => {
    openMock.mockResolvedValueOnce(null);
    const wrapper = mount(FilesUploadArea, { props: { maxSizeMb: 5 } });

    await wrapper.find('[data-testid="pick-files"]').trigger("click");
    await vi.waitFor(() => expect(openMock).toHaveBeenCalled());

    expect(wrapper.emitted("filesSelected")).toBeUndefined();
  });

  it("shows validation errors for invalid dropped files", async () => {
    const wrapper = mount(FilesUploadArea, { props: { maxSizeMb: 5 } });

    const badFile = new File(["x"], "notes.txt", { type: "text/plain" });
    const event = new Event("drop") as DragEvent;
    Object.defineProperty(event, "dataTransfer", {
      value: { files: [badFile] },
    });

    wrapper.element.dispatchEvent(event);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('[data-testid="upload-error"]')).toHaveLength(1);
    expect(wrapper.text()).toMatch(/notes\.txt/);
    expect(wrapper.emitted("filesSelected")).toBeUndefined();
  });

  it("emits paths of valid dropped files", async () => {
    const wrapper = mount(FilesUploadArea, { props: { maxSizeMb: 5 } });

    const goodFile = Object.assign(new File(["x"], "report.pdf"), {
      path: "/tmp/report.pdf",
    });
    const event = new Event("drop") as DragEvent;
    Object.defineProperty(event, "dataTransfer", {
      value: { files: [goodFile] },
    });

    wrapper.element.dispatchEvent(event);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("filesSelected")).toEqual([[["/tmp/report.pdf"]]]);
  });
});
