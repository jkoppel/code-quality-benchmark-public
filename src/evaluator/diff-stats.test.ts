import dedent from "dedent";
import { describe, expect, it } from "vitest";
import { DiffStats } from "./diff-stats.ts";

describe("DiffStats.makeFromDiffstat", () => {
  it("should parse valid diffstat output", () => {
    const input = dedent`
      INSERTED,DELETED,MODIFIED,FILENAME
      0,1,0,"b"
      1,0,0,"b/d"
      3,0,1,"path/someotherfile.txt"
    `;

    const diffStats = DiffStats.makeFromDiffstat(input);

    expect(diffStats.getNumFilesChanged()).toBe(3);
    expect(diffStats.getNumLinesChanged()).toBe(6); // 0+1+0 + 1+0+0 + 3+0+1 = 6
  });

  it("should handle quoted filenames", () => {
    const input = `INSERTED,DELETED,MODIFIED,FILENAME
0,1,0,"quoted file.txt"`;

    const diffStats = DiffStats.makeFromDiffstat(input);
    const detailed = diffStats.getDetailedStats();

    expect(detailed[0].filename).toBe("quoted file.txt");
  });

  it("should handle unquoted filenames", () => {
    const input = `INSERTED,DELETED,MODIFIED,FILENAME
1,2,3,unquoted.txt`;

    const diffStats = DiffStats.makeFromDiffstat(input);
    const detailed = diffStats.getDetailedStats();

    expect(detailed[0].filename).toBe("unquoted.txt");
    expect(detailed[0].insertions).toBe(1);
    expect(detailed[0].deletions).toBe(2);
    expect(detailed[0].modifications).toBe(3);
  });

  it("should handle filenames with commas", () => {
    const input = `INSERTED,DELETED,MODIFIED,FILENAME
1,2,0,path/file,with,commas.txt`;

    const diffStats = DiffStats.makeFromDiffstat(input);
    const detailed = diffStats.getDetailedStats();

    expect(detailed[0].filename).toBe("path/file,with,commas.txt");
  });

  it("should handle header-only input", () => {
    const input = `INSERTED,DELETED,MODIFIED,FILENAME`;

    const diffStats = DiffStats.makeFromDiffstat(input);

    expect(diffStats.getNumFilesChanged()).toBe(0);
    expect(diffStats.getNumLinesChanged()).toBe(0);
    expect(diffStats.getDetailedStats()).toHaveLength(0);
  });

  it("should throw error for invalid header", () => {
    const input = dedent`
      WRONG,HEADER,FORMAT
      0,1,0,"file.txt"
    `;

    expect(() => DiffStats.makeFromDiffstat(input)).toThrow(
      "Invalid diffstat output format",
    );
  });

  it("should throw error for insufficient CSV columns", () => {
    const input = `INSERTED,DELETED,MODIFIED,FILENAME
1,2`;

    expect(() => DiffStats.makeFromDiffstat(input)).toThrow(
      "Invalid CSV line: 1,2",
    );
  });

  it("should ignore empty lines after header", () => {
    const input = dedent`
      INSERTED,DELETED,MODIFIED,FILENAME
      1,0,0,file1.txt

      2,1,0,file2.txt
    `;

    const diffStats = DiffStats.makeFromDiffstat(input);

    expect(diffStats.getNumFilesChanged()).toBe(2);
    expect(diffStats.getNumLinesChanged()).toBe(4); // 1+0+0 + 2+1+0 = 4
  });
});

describe("DiffStats", () => {
  it("should aggregate summary statistics correctly across multiple files", () => {
    const input = dedent`
      INSERTED,DELETED,MODIFIED,FILENAME
      5,3,2,"file1.txt"
      1,1,1,"file2.txt"
    `;

    const diffStats = DiffStats.makeFromDiffstat(input);

    expect(diffStats.getNumFilesChanged()).toBe(2);
    expect(diffStats.getNumLinesChanged()).toBe(13); // 5+3+2 + 1+1+1 = 13
  });

  // TODO: not sure actually that we want to guarantee that file order stays the same, but let's go with this for now
  it("should preserve per-file statistics and maintain file order", () => {
    const input = dedent`
      INSERTED,DELETED,MODIFIED,FILENAME
      0,1,0,"b"
      1,0,0,"b/d"
    `;

    const diffStats = DiffStats.makeFromDiffstat(input);
    const detailed = diffStats.getDetailedStats();

    expect(detailed).toHaveLength(2);

    expect(detailed[0]).toEqual({
      filename: "b",
      insertions: 0,
      deletions: 1,
      modifications: 0,
    });

    expect(detailed[1]).toEqual({
      filename: "b/d",
      insertions: 1,
      deletions: 0,
      modifications: 0,
    });
  });
});
