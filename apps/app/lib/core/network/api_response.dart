/// Generic response envelope matching standard backend API JSON structure
class ApiResponse<T> {
  final bool success;
  final int? statusCode;
  final String? message;
  final T? data;
  final PaginationMeta? meta;
  final List<ApiErrorMessage>? errorMessages;

  const ApiResponse({
    required this.success,
    this.statusCode,
    this.message,
    this.data,
    this.meta,
    this.errorMessages,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic data)? fromJsonT,
  ) {
    final rawData = json['data'];
    T? parsedData;

    if (rawData != null && fromJsonT != null) {
      parsedData = fromJsonT(rawData);
    } else if (rawData is T) {
      parsedData = rawData;
    }

    PaginationMeta? meta;
    if (json['meta'] != null && json['meta'] is Map<String, dynamic>) {
      meta = PaginationMeta.fromJson(json['meta'] as Map<String, dynamic>);
    } else if (json['pagination'] != null && json['pagination'] is Map<String, dynamic>) {
      meta = PaginationMeta.fromJson(json['pagination'] as Map<String, dynamic>);
    }

    List<ApiErrorMessage>? errors;
    if (json['errorMessages'] != null && json['errorMessages'] is List) {
      errors = (json['errorMessages'] as List)
          .map((e) => ApiErrorMessage.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      statusCode: json['statusCode'] as int?,
      message: json['message'] as String?,
      data: parsedData,
      meta: meta,
      errorMessages: errors,
    );
  }
}

/// Pagination metadata for list responses
class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPage;

  const PaginationMeta({
    this.page = 1,
    this.limit = 10,
    this.total = 0,
    this.totalPage = 1,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 10,
      total: (json['total'] as num?)?.toInt() ?? 0,
      totalPage: (json['totalPage'] as num?)?.toInt() ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
        'page': page,
        'limit': limit,
        'total': total,
        'totalPage': totalPage,
      };
}

/// Field-level error message from backend
class ApiErrorMessage {
  final String? path;
  final String message;

  const ApiErrorMessage({
    this.path,
    required this.message,
  });

  factory ApiErrorMessage.fromJson(Map<String, dynamic> json) {
    return ApiErrorMessage(
      path: json['path'] as String?,
      message: json['message'] as String? ?? 'An error occurred',
    );
  }

  Map<String, dynamic> toJson() => {
        if (path != null) 'path': path,
        'message': message,
      };
}
