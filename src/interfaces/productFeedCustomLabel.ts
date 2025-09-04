export type TComparator = "!=" | "<" | "<=" | "=" | ">" | ">=";
export interface IProductFeedCustomLabel {
  idCustomLabel?: number;
  Argument: string;
  Label: string;
  CodLabel: 0 | 1 | 2 | 3 | 4;
  Comparator: TComparator;
  Order?: number;
}
