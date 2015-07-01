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
# 16. id (auth_conf_year)
# 17. references (ref1;ref2;...)
#
# Column 16 is called "filename" in the .tsv file, but really these are unique ids.
# Column 17 is called "Citations" in the .tsv file, but really these are references
# that this paper makes to other papers of the dataset.
#
# The script also tries to find citations for each paper,
# scanning through the references of all papers to add relevant citations
# to the papers contained in this dataset.

import json
import sys
import os
import functools


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vis-to-json.py <papers.tsv> [<citation_counts.json]")
        exit (1);

    input_file = open(sys.argv[1])
    papers = {}

    # skip headers row
    next(input_file)

    for line in input_file.readlines():
        # Drop whitespace at the end, and split on tabs.
        vals = line.split('\t')

        # temporary: reject any paper that have no xplore number
        if vals[7] == '':
            print("incomplete paper: xplore=",vals[7]," title=",vals[2])
        else:

            # Build a new dictionary with the values for the paper.
            paper = {}
            paper['conference']     = vals[0]
            paper['year']           = vals[1]
            paper['title']          = vals[2]
            paper['doi']            = vals[3]
            paper['url']            = vals[4]
            paper['xplore']         = vals[7]
            paper['abstract']       = vals[10]
            paper['authors']        = vals[15].split(';')
            paper['id']             = vals[16]
            paper['references']     = [] if vals[17] == "" else vals[17].split(';')
            paper['citations']      = []
            paper['citation_count'] = -1  # will be set to 0 below if no external citation count is available

            # Index papers by xplore number to add citations later
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
                print("Not found id: " + ref)
                pass

    # Read external citation counts file, if any
    if len(sys.argv) == 3:
        ccs = None
        with open(sys.argv[2]) as citation_counts_json:
           ccs = json.loads(citation_counts_json.read())

        # The following process adds citation count information to every
        # paper that can be found on the specified citation_counts file.
        for ieeex in ccs.keys():
            try:
                papers[ieeex]['citation_count'] = ccs[ieeex]['citation_count']
            except KeyError:
                # Skip this one, there's no paper with that id in our dataset.
                print("Not found id: " + ieeex)
                pass

    ## Summary

    # Print a summary of the dataset
    print(len(papers), "papers")
    print(len([p for p in papers.values() if p['citation_count'] > -1]), "papers have an external citation count")

    # Set citation_count to 0 by default if no external count could be found
    for p in papers.values():
        if p['citation_count'] == -1:
            p['citation_count'] = 0
 
    # Number of references and citations in the whole dataset.
    # If the dataset is self-contained, these numbers should be the same.
    print(functools.reduce(lambda x,y: x+y, [len(p['references']) for p in papers.values()]), "references")
    print(functools.reduce(lambda x,y: x+y, [len(p['citations']) for p in papers.values()]), "citations")


    ## Outputs

    # If no citation counts file was provided, write out a JSON file with a list of urls to crawl
    if len(sys.argv) == 2:
        outname=os.path.dirname(sys.argv[1]) + '/URLs_to_scrape.json'
        with open(outname, 'w') as outfile:
            outfile.writelines("https://www.google.com/webhp#q=site:ieeexplore.ieee.org+%s\n" % p['xplore'] for p in papers.values() if p['xplore'] is not "")

        print("urls written in " + outname)

        
    # Write out a JSON file with everything in it.
    outname=os.path.splitext(sys.argv[1])[0] + '.json'
    with open(outname, 'w') as outfile:
        json.dump({"papers":papers}, outfile)

    print("json written in " + outname)
