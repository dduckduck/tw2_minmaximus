import argparse
import pandas as pd
import sys


def xml_to_csv(xml_file, csv_file, tags):
    try:
        df = pd.read_xml(xml_file)
    except Exception as e:
        print(f"Error reading XML: {e}")
        sys.exit(1)

    tags_present = [t for t in tags if t in df.columns]
    if not tags_present:
        print("None of the specified tags were found in the XML.")
        sys.exit(1)

    df[tags_present].to_csv(csv_file, index=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert XML to CSV")
    parser.add_argument("xml_file", help="Input XML file")
    parser.add_argument("csv_file", help="Output CSV file")
    parser.add_argument("tags", nargs="+", help="List of tags to extract")
    args = parser.parse_args()

    xml_to_csv(args.xml_file, args.csv_file, args.tags)
