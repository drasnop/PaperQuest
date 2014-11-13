################################################################################
# 
# Parses a tab-separated dataset file of papers from CHI and UIST and
# turns it into JSON.  Each row in the file has the columns:
#
# 1. conference
# 2. year
# 3. title
# 4. abstract
# 5. authors
# 6. doi
# 7. references
#
# where authors is of the form author1~author2~...~authorN and the
# references are doi's of other publications, using up as many extra
# columns as there are references for the paper.
#
# The script also tries to complete the citation information for each
# paper, scanning through the references to add relevant citations to
# the papers contained in this dataset.

import json
import sys


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print "Usage: python chi-to-json.py <papers.tsv>"
        exit (1);

    input_file = open(sys.argv[1])
    papers = {}

    for line in input_file.readlines():
        # Drop whitespace at the end, and split on tabs.
        vals = line.rstrip().split('\t')

        # Build a new dictionary with the values for the paper.
        paper = {}
        paper['conference'] = vals[0]
        paper['year']       = vals[1]
        paper['title']      = vals[2]
        paper['abstract']   = vals[3]
        paper['authors']    = vals[4].split('~')
        # paper['doi']      = vals[5]
        paper['references'] = vals[6:]
        paper['citations']  = []

        # Index papers by doi to set up for building citations.
        papers[vals[5]] = paper

    # Once we have a dictionary with all papers, go through them again
    # building the citations
    for doi, paper in papers.iteritems():
        for ref in paper['references']:
            try:
                papers[ref]['citations'].append(doi)
            except KeyError:
                # Skip this one, there's no paper with that doi in our dataset.
                #print "Not found " + ref
                pass

    # For debugging: number of references and citations in the whole
    # dataset.  If the dataset is self-contained, these numbers should
    # be the same.
    #print len(papers)
    #print reduce(lambda x,y: x+y, [len(p['references']) for p in papers.values()])
    #print reduce(lambda x,y: x+y, [len(p['citations']) for p in papers.values()])

    # Write out a JSON object with everything in it.
    print json.dumps({'papers': papers.values()})
