// Using enum vs boolean to clarify meaning of query param over needing to lookup true/false functionality

enum SearchCriteria
{
    All,
    Any
}

export = SearchCriteria