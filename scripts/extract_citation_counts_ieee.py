################################################################################
#
# Extracts citation counts from Google Search results, looking for
# specific patterns within the results. The scripts assumes it
# receives as input a file with a JSON array containing all the
# results, such as those returned by KimonoLabs. All results should be
# in the 'collection1', and they should all be called 'result'.

import json
import re
import sys
import os


citationPattern = re.compile('(.*)Cited by (\d+).*')
# Extracts the DOI suffix of a publication from a dl.acm.org URL
xploreNumberPattern = re.compile('.*arnumber=(\d+).*')

def extractXploreNumber(s):
    return xploreNumberPattern.findall(s)[0]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_citation_counts.py <kimono_results.json>")
        exit (1);

    results = None

    # Parse the contents of the input file into a Python
    # object. They're expected to be in JSON, as output by Kimono
    with open(sys.argv[1]) as input_file:
        results = json.loads(input_file.read())

    # Get rid of extra elements, keep just the actual results. Keep
    # only those that have a URL pointing to the IEEE XPLORE
    # library. Filter out results that don't seem to contain citation
    # count information. We use regular expressions to search for a
    # "Cited by" string.
    results = [r for r in results['results']['collection1']
               if (r['result']['href'].find('arnumber=') >= 0 and
                   citationPattern.search(r['result']['text']))]

    counts = {}
    for r in results:
        tmp = citationPattern.findall(r['result']['text'])[0]

        # Extract the IEEE xplore number from the IEEE URL
        ieeex=extractXploreNumber(r['result']['href'])

        # Make sure this is one of the papers we are looking for, by checking the url of the associated google search
        if ieeex == r['url'].split("+")[1]:

            # Store the citation count and the title of the paper (unused), indexed by IEEE xplore number
            counts[ieeex] = dict(title=tmp[0], citation_count=int(tmp[1]))
    
    # Print summary
    print(len(results), "results containing both an ieee xplore number and a citation count")
    print(len(counts), "unique papers containing both an ieee xplore number and a citation count")

    # Write citation counts in a file
    outname=os.path.dirname(sys.argv[1]) +'/citation_counts.json'
    with open(outname, 'w') as outfile:
        json.dump(counts, outfile)

    print("citation counts written in " + outname)
