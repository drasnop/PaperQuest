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


def partialDOIMatch(d1, d2):
    """
    Assumes d1 is a "full DOI", like '10.1145/1166253.1166292', and d2
    is a partial DOI, like '1166292' or '1166253.1166292'.  Returns true
    if they match and false otherwise.

    Note that in the previous case, a partial like '292' would be a
    negative match.  The partial must contain full subsections.
    """
    if (d2.find('.') >= 0):
        return d2 == d1.split('/')[-1]
    return d2 == d1.split('.')[-1]


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Usage: python chi-to-json.py <papers.tsv> <citation_counts.json>"
        exit (1);

    input_file = open(sys.argv[1])
    papers = {}

    for line in input_file.readlines():
        # Drop whitespace at the end, and split on tabs.
        vals = line.rstrip().split('\t')

        # Build a new dictionary with the values for the paper.
        paper = {}
        paper['conference']     = vals[0]
        paper['year']           = vals[1]
        paper['title']          = vals[2]
        paper['abstract']       = vals[3]
        paper['authors']        = vals[4].split('~')
        # paper['doi']          = vals[5]
        paper['references']     = vals[6:]
        paper['citations']      = []
        paper['citation_count'] = 0  # All papers have a 0 CC by default

        # Index papers by doi to set up for building citations.
        papers[vals[5]] = paper

    input_file.close()

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

    ccs = None
    with open(sys.argv[2]) as citation_counts_json:
       ccs = json.loads(citation_counts_json.read())

    # The following process adds citation count information to every
    # paper that can be found on the specified file.  This is a slow
    # process because we don't use the hash function in dict, but it
    # shouldn't have to run frequently.
    for d2 in ccs.keys():
        matches = [d1 for d1 in papers.keys() if partialDOIMatch(d1, d2)]
        if matches:
            papers[matches[0]]['citation_count'] = ccs[d2]['citation_count']

    # Write out a JSON object with everything in it.
    print json.dumps({'papers': papers})
