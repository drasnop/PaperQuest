################################################################################
# 
# Parses a tab-separated dataset file of papers from InfoVis, SciVis, and VAST;
# and turns it into JSON.  Each row in the file has the columns:
#
# 0. conference
# 1. year
# 2. title
# 3. doi
# 4. url
# 7. IEEE XPLORE number (unique id)
# 10. abstract
# 15. authors (author1;author2;...)
# 17. references (ref1;ref2;...)
#
# Column 17 uses the ids of column 5. It is called "Citations" in the .tsv file,
# but really these are references that this paper makes to other papers.
#
# The script also tries to find citations for each paper,
# scanning through the references of all papers to add relevant citations
# to the papers contained in this dataset.

import json
import sys
import os
import functools


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python vis-to-json.py <papers.tsv>")
        exit (1);

    input_file = open(sys.argv[1])
    papers = {}

    for line in input_file.readlines():
        # Drop whitespace at the end, and split on tabs.
        vals = line.split('\t')

        # Build a new dictionary with the values for the paper.
        paper = {}
        paper['conference']     = vals[0]
        paper['year']           = vals[1]
        paper['title']          = vals[2]
        paper['doi']            = vals[3]
        paper['url']            = vals[4]
        # paper['id']           = vals[7]
        paper['abstract']       = vals[10]
        paper['authors']        = vals[15].split(';')
        paper['references']     = vals[17].split(';')
        paper['citations']      = []
        paper['citation_count'] = 0  # All papers have a 0 CC by default

        # Index papers by id to set up for building citations.
        papers[vals[7]] = paper

    input_file.close()

    # Once we have a dictionary with all papers, go through them again
    # building the citations
    for id, paper in papers.items():
        for ref in paper['references']:
            try:
                papers[ref]['citations'].append(id)
            except KeyError:
                # Skip this one, there's no paper with that id in our dataset.
                print("Not found " + ref)
                pass

    # For debugging: number of references and citations in the whole
    # dataset.  If the dataset is self-contained, these numbers should
    # be the same.
    print(len(papers))
    print(functools.reduce(lambda x,y: x+y, [len(p['references']) for p in papers.values()]))
    print(functools.reduce(lambda x,y: x+y, [len(p['citations']) for p in papers.values()]))

    # so far, no external citation counts

    # Write out a JSON object with everything in it.
    outname=os.path.splitext(sys.argv[1])[0] + '.json'
    with open(outname, 'w') as outfile:
        json.dump(papers, outfile)

    print("json written in " + outname)
